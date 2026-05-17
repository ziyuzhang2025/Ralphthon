import { z } from "zod";
import { createDailyRoomForBooking } from "@/lib/integrations/daily";
import { createCheckoutForBooking } from "@/lib/integrations/stripe";
import { getMarketplaceState } from "@/lib/mock-db";
import {
  findMongoCoachByApplicationEmail,
  findMongoCoachById,
  findMongoCoachByUserId,
  insertMongoCoach,
  isMongoCoachStoreConfigured,
  listMongoCoaches,
  updateMongoCoach,
} from "@/lib/mongo-coaches";
import {
  AccessDeniedError,
  NotFoundError,
  ValidationError,
  assertRole,
  canCreateBooking,
  canJoinBooking,
  canManageCoachReview,
  canViewCoachProfile,
  isJoinWindowOpen,
} from "@/lib/permissions";
import type {
  AuditAction,
  Booking,
  CheckoutResult,
  CoachProfile,
  JoinDetails,
  MarketplaceState,
  Payment,
  User,
} from "@/lib/types";

const coachApplicationSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  title: z.string().min(8),
  bio: z.string().min(24),
  specialties: z.array(z.string().min(2)).min(1),
  credentials: z.array(z.string().min(2)).min(1),
  yearsExperience: z.number().int().min(1).max(50),
  hourlyRateCents: z.number().int().min(2500).max(30000),
});

const checkoutSchema = z.object({
  coachId: z.string().min(1),
  playerProfileId: z.string().min(1),
  availabilityWindowId: z.string().min(1),
});

function id(prefix: string, count: number) {
  return `${prefix}-${count + 1}`;
}

function uniqueId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function now() {
  return new Date().toISOString();
}

function addAudit(
  state: MarketplaceState,
  actorId: string,
  action: AuditAction,
  targetType: "coach" | "booking" | "payment",
  targetId: string,
  metadata?: Record<string, string | number | boolean | null>,
) {
  state.auditEvents.unshift({
    id: id("audit", state.auditEvents.length),
    actorId,
    action,
    targetType,
    targetId,
    metadata,
    createdAt: now(),
  });
}

async function getCoachProfilesForRead() {
  const state = getMarketplaceState();

  try {
    const mongoCoaches = await listMongoCoaches();
    return mongoCoaches ?? state.coachProfiles;
  } catch {
    return state.coachProfiles;
  }
}

async function findCoachProfileForRead(coachId: string) {
  try {
    const mongoCoach = await findMongoCoachById(coachId);

    if (mongoCoach !== null) {
      return mongoCoach;
    }
  } catch {
    // Keep the demo app usable if Atlas is temporarily unavailable.
  }

  return getMarketplaceState().coachProfiles.find((profile) => profile.id === coachId);
}

export async function listApprovedCoaches(filters?: { specialty?: string; query?: string }) {
  const coaches = await getCoachProfilesForRead();
  const query = filters?.query?.toLowerCase().trim();
  const specialty = filters?.specialty?.toLowerCase().trim();

  return coaches
    .filter((coach) => coach.status === "approved")
    .filter((coach) => {
      if (!specialty || specialty === "all") {
        return true;
      }

      return coach.specialties.some((item) => item.toLowerCase() === specialty);
    })
    .filter((coach) => {
      if (!query) {
        return true;
      }

      const haystack = [
        coach.name,
        coach.title,
        coach.bio,
        coach.specialties.join(" "),
        coach.credentials.join(" "),
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    })
    .sort((a, b) => b.rating - a.rating);
}

export async function listSpecialties() {
  return Array.from(
    new Set(
      (await listApprovedCoaches())
        .flatMap((coach) => coach.specialties)
        .map((specialty) => specialty.toLowerCase()),
    ),
  ).sort();
}

export async function getCoachById(coachId: string, user?: User) {
  const coach = await findCoachProfileForRead(coachId);

  if (!coach || !canViewCoachProfile(user, coach)) {
    throw new NotFoundError("Coach profile not found.");
  }

  return coach;
}

export function getOpenAvailability(coachId: string) {
  const state = getMarketplaceState();
  return state.availabilityWindows
    .filter((slot) => slot.coachId === coachId && !slot.bookedBookingId)
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());
}

export async function getGuardianDashboard(user: User) {
  assertRole(user, ["guardian"]);
  const state = getMarketplaceState();
  const coaches = await getCoachProfilesForRead();
  const bookings = state.bookings
    .filter((booking) => booking.guardianId === user.id)
    .map((booking) => ({
      booking,
      coach: coaches.find((coach) => coach.id === booking.coachId),
      player: state.playerProfiles.find((player) => player.id === booking.playerProfileId),
    }));

  return {
    user,
    players: state.playerProfiles.filter((player) => player.guardianId === user.id),
    bookings,
    messages: state.messages.filter((message) =>
      bookings.some(({ booking }) => booking.id === message.bookingId),
    ),
  };
}

export async function getCoachDashboard(user: User) {
  assertRole(user, ["coach"]);
  const state = getMarketplaceState();
  const mongoCoach = await findMongoCoachByUserId(user.id).catch(() => null);
  const coach =
    mongoCoach ?? state.coachProfiles.find((profile) => profile.userId === user.id);

  if (!coach) {
    throw new NotFoundError("Coach profile not found.");
  }

  const bookings = state.bookings
    .filter((booking) => booking.coachId === coach.id)
    .map((booking) => ({
      booking,
      guardian: state.users.find((guardian) => guardian.id === booking.guardianId),
      player: state.playerProfiles.find((player) => player.id === booking.playerProfileId),
    }));

  return {
    user,
    coach,
    bookings,
    availability: getOpenAvailability(coach.id),
  };
}

export async function getAdminReviewQueue(user: User) {
  assertRole(user, ["admin"]);
  const state = getMarketplaceState();
  const coaches = await getCoachProfilesForRead();

  return {
    pendingCoaches: coaches.filter((coach) => coach.status === "pending_review"),
    auditEvents: state.auditEvents.slice(0, 12),
  };
}

export async function submitCoachApplication(input: unknown) {
  const state = getMarketplaceState();
  const parsed = coachApplicationSchema.parse(input);
  const existingUser = state.users.find((user) => user.email === parsed.email);
  const user =
    existingUser ??
    ({
      id: id("user-coach", state.users.length),
      role: "coach" as const,
      name: parsed.name,
      email: parsed.email,
      createdAt: now(),
    } satisfies User);

  if (!existingUser) {
    state.users.push(user);
  }

  const existingMongoProfile = await findMongoCoachByApplicationEmail(parsed.email);
  const existingProfile =
    existingMongoProfile ?? state.coachProfiles.find((coach) => coach.userId === user.id);

  if (existingProfile && existingProfile.status !== "rejected") {
    throw new ValidationError("A coach application already exists for this email.");
  }

  const coach: CoachProfile = {
    id: isMongoCoachStoreConfigured()
      ? uniqueId("coach")
      : id("coach", state.coachProfiles.length),
    userId: user.id,
    name: parsed.name,
    title: parsed.title,
    locationLabel: "Remote video lessons",
    status: "pending_review",
    bio: parsed.bio,
    specialties: parsed.specialties,
    credentials: parsed.credentials,
    yearsExperience: parsed.yearsExperience,
    hourlyRateCents: parsed.hourlyRateCents,
    rating: 0,
    reviewCount: 0,
    sessionLengthMinutes: 45,
    payoutReady: false,
    imageUrl: "/images/coach-hill.png",
    createdAt: now(),
  };

  await insertMongoCoach(coach, parsed.email);
  state.coachProfiles.push(coach);
  addAudit(state, user.id, "coach.submitted", "coach", coach.id, {
    specialties: parsed.specialties.join(", "),
  });

  return coach;
}

export async function approveCoach(coachId: string, actor: User) {
  const state = getMarketplaceState();

  if (!canManageCoachReview(actor)) {
    throw new AccessDeniedError();
  }

  const reviewedAt = now();
  const mongoCoach = await updateMongoCoach(coachId, {
    status: "approved",
    reviewedAt,
    rejectionReason: undefined,
  });

  if (mongoCoach === undefined) {
    throw new NotFoundError("Coach profile not found.");
  }

  const coach =
    mongoCoach ?? state.coachProfiles.find((profile) => profile.id === coachId);

  if (!coach) {
    throw new NotFoundError("Coach profile not found.");
  }

  coach.status = "approved";
  coach.reviewedAt = reviewedAt;
  coach.rejectionReason = undefined;
  addAudit(state, actor.id, "coach.approved", "coach", coach.id);

  return coach;
}

export async function rejectCoach(
  coachId: string,
  actor: User,
  reason = "Credentials need more review.",
) {
  const state = getMarketplaceState();

  if (!canManageCoachReview(actor)) {
    throw new AccessDeniedError();
  }

  const reviewedAt = now();
  const mongoCoach = await updateMongoCoach(coachId, {
    status: "rejected",
    reviewedAt,
    rejectionReason: reason,
  });

  if (mongoCoach === undefined) {
    throw new NotFoundError("Coach profile not found.");
  }

  const coach =
    mongoCoach ?? state.coachProfiles.find((profile) => profile.id === coachId);

  if (!coach) {
    throw new NotFoundError("Coach profile not found.");
  }

  coach.status = "rejected";
  coach.reviewedAt = reviewedAt;
  coach.rejectionReason = reason;
  addAudit(state, actor.id, "coach.rejected", "coach", coach.id, { reason });

  return coach;
}

export async function createBookingCheckout(
  input: unknown,
  actor: User,
  origin = "http://localhost:3000",
): Promise<CheckoutResult> {
  const state = getMarketplaceState();
  const parsed = checkoutSchema.parse(input);

  if (!canCreateBooking(actor)) {
    throw new AccessDeniedError("Only guardians can book youth coaching sessions.");
  }

  const coach = await findCoachProfileForRead(parsed.coachId);

  if (!coach || coach.status !== "approved") {
    throw new NotFoundError("Approved coach not found.");
  }

  const player = state.playerProfiles.find(
    (profile) => profile.id === parsed.playerProfileId && profile.guardianId === actor.id,
  );

  if (!player) {
    throw new NotFoundError("Player profile not found for this guardian.");
  }

  const slot = state.availabilityWindows.find(
    (window) =>
      window.id === parsed.availabilityWindowId &&
      window.coachId === coach.id &&
      !window.bookedBookingId,
  );

  if (!slot) {
    throw new ValidationError("This session time is no longer available.");
  }

  const booking: Booking = {
    id: id("booking", state.bookings.length),
    guardianId: actor.id,
    coachId: coach.id,
    playerProfileId: player.id,
    availabilityWindowId: slot.id,
    startsAt: slot.startsAt,
    endsAt: slot.endsAt,
    status: "pending_payment",
    priceCents: coach.hourlyRateCents,
    platformFeeCents: Math.round(coach.hourlyRateCents * 0.15),
    createdAt: now(),
    updatedAt: now(),
  };

  const checkout = await createCheckoutForBooking({ booking, coach, origin });
  booking.stripeCheckoutSessionId = checkout.checkoutSessionId;
  slot.bookedBookingId = booking.id;

  const payment: Payment = {
    id: id("payment", state.payments.length),
    bookingId: booking.id,
    stripeCheckoutSessionId: checkout.checkoutSessionId,
    amountCents: booking.priceCents,
    platformFeeCents: booking.platformFeeCents,
    status: "requires_payment",
    createdAt: now(),
  };

  state.bookings.push(booking);
  state.payments.push(payment);
  addAudit(state, actor.id, "booking.created", "booking", booking.id, {
    checkoutMode: checkout.mode,
  });

  return {
    booking,
    checkoutUrl: checkout.checkoutUrl,
    mode: checkout.mode,
  };
}

export async function fulfillCheckoutSession(checkoutSessionId: string, bookingId?: string) {
  const state = getMarketplaceState();
  const booking =
    state.bookings.find((item) => item.id === bookingId) ??
    state.bookings.find((item) => item.stripeCheckoutSessionId === checkoutSessionId);

  if (!booking) {
    throw new NotFoundError("Booking not found for Checkout session.");
  }

  const payment = state.payments.find(
    (item) => item.bookingId === booking.id && item.stripeCheckoutSessionId === checkoutSessionId,
  );

  if (payment?.status === "paid" && booking.dailyRoomUrl) {
    return booking;
  }

  booking.status = "paid";
  booking.updatedAt = now();

  if (payment) {
    payment.status = "paid";
    payment.paidAt = now();
  }

  if (!booking.dailyRoomUrl) {
    const room = await createDailyRoomForBooking(booking);
    booking.dailyRoomName = room.roomName;
    booking.dailyRoomUrl = room.roomUrl;
    booking.status = "room_ready";
    booking.updatedAt = now();
    addAudit(state, booking.guardianId, "video_room.created", "booking", booking.id, {
      mode: room.mode,
    });
  }

  addAudit(state, booking.guardianId, "booking.paid", "booking", booking.id);
  return booking;
}

export async function getBookingJoinDetails(
  bookingId: string,
  actor: User,
  currentTime = new Date(),
): Promise<JoinDetails> {
  const state = getMarketplaceState();
  const booking = state.bookings.find((item) => item.id === bookingId);

  if (!booking) {
    throw new NotFoundError("Booking not found.");
  }

  const coach = await findCoachProfileForRead(booking.coachId);

  if (!canJoinBooking(actor, booking, coach)) {
    throw new AccessDeniedError();
  }

  if (!["paid", "room_ready"].includes(booking.status)) {
    throw new ValidationError("The session is not ready until payment is confirmed.");
  }

  if (!isJoinWindowOpen(booking, currentTime)) {
    throw new ValidationError("The video room opens 15 minutes before the session.");
  }

  if (!booking.dailyRoomUrl) {
    const room = await createDailyRoomForBooking(booking);
    booking.dailyRoomName = room.roomName;
    booking.dailyRoomUrl = room.roomUrl;
    booking.status = "room_ready";
    booking.updatedAt = now();
  }

  if (!coach) {
    throw new NotFoundError("Coach not found.");
  }

  return {
    booking,
    coach,
    roomUrl: booking.dailyRoomUrl,
    roomName: booking.dailyRoomName ?? booking.id,
    opensAt: new Date(new Date(booking.startsAt).getTime() - 15 * 60 * 1000).toISOString(),
    closesAt: new Date(new Date(booking.endsAt).getTime() + 90 * 60 * 1000).toISOString(),
  };
}
