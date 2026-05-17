import type { MarketplaceState } from "@/lib/types";

const now = new Date("2026-05-17T14:00:00.000Z");

function addDays(days: number, hour: number, minute = 0) {
  const date = new Date(now);
  date.setUTCDate(date.getUTCDate() + days);
  date.setUTCHours(hour, minute, 0, 0);
  return date.toISOString();
}

export function createInitialState(): MarketplaceState {
  return {
    users: [
      {
        id: "user-guardian-1",
        role: "guardian",
        name: "Maya Chen",
        email: "maya@example.com",
        createdAt: "2026-05-01T12:00:00.000Z",
      },
      {
        id: "user-coach-1",
        role: "coach",
        name: "Coach Daniel Reyes",
        email: "daniel@example.com",
        stripeConnectAccountId: "acct_demo_reyes",
        createdAt: "2026-04-18T12:00:00.000Z",
      },
      {
        id: "user-coach-2",
        role: "coach",
        name: "Coach Priya Nair",
        email: "priya@example.com",
        stripeConnectAccountId: "acct_demo_nair",
        createdAt: "2026-04-19T12:00:00.000Z",
      },
      {
        id: "user-coach-3",
        role: "coach",
        name: "Coach Marcus Hill",
        email: "marcus@example.com",
        stripeConnectAccountId: "acct_demo_hill",
        createdAt: "2026-05-12T12:00:00.000Z",
      },
      {
        id: "user-admin-1",
        role: "admin",
        name: "LeagueOps Admin",
        email: "ops@example.com",
        createdAt: "2026-04-01T12:00:00.000Z",
      },
    ],
    playerProfiles: [
      {
        id: "player-1",
        guardianId: "user-guardian-1",
        firstName: "Leo",
        ageBand: "11-13",
        focusAreas: ["hitting", "fielding"],
        notes: "Right-handed hitter preparing for summer tournament play.",
        createdAt: "2026-05-02T12:00:00.000Z",
      },
    ],
    coachProfiles: [
      {
        id: "coach-1",
        userId: "user-coach-1",
        name: "Coach Daniel Reyes",
        title: "Former minor league hitting instructor",
        locationLabel: "Remote video lessons",
        status: "approved",
        bio: "Daniel breaks swings into repeatable checkpoints and gives guardians a concise practice plan after every lesson.",
        specialties: ["hitting", "approach", "tee work"],
        credentials: ["MiLB hitting coordinator", "USA Baseball certified", "12U-17U development"],
        yearsExperience: 12,
        hourlyRateCents: 8500,
        rating: 4.9,
        reviewCount: 48,
        sessionLengthMinutes: 45,
        payoutReady: true,
        stripeConnectAccountId: "acct_demo_reyes",
        imageUrl: "/images/coach-reyes.png",
        createdAt: "2026-04-18T12:00:00.000Z",
        reviewedAt: "2026-04-20T12:00:00.000Z",
      },
      {
        id: "coach-2",
        userId: "user-coach-2",
        name: "Coach Priya Nair",
        title: "Pitching mechanics and arm-care specialist",
        locationLabel: "Remote video lessons",
        status: "approved",
        bio: "Priya focuses on clean throwing patterns, workload awareness, and pitch-command habits for youth athletes.",
        specialties: ["pitching", "arm care", "command"],
        credentials: ["D1 pitching analyst", "Pitch design certificate", "SafeSport trained"],
        yearsExperience: 9,
        hourlyRateCents: 9500,
        rating: 4.8,
        reviewCount: 37,
        sessionLengthMinutes: 45,
        payoutReady: true,
        stripeConnectAccountId: "acct_demo_nair",
        imageUrl: "/images/coach-nair.png",
        createdAt: "2026-04-19T12:00:00.000Z",
        reviewedAt: "2026-04-21T12:00:00.000Z",
      },
      {
        id: "coach-3",
        userId: "user-coach-3",
        name: "Coach Marcus Hill",
        title: "Catcher development and game-calling coach",
        locationLabel: "Remote video lessons",
        status: "pending_review",
        bio: "Marcus helps catchers improve receiving, footwork, throwing rhythm, and in-game communication.",
        specialties: ["catching", "throwing", "game IQ"],
        credentials: ["College catching coach", "Background check pending"],
        yearsExperience: 7,
        hourlyRateCents: 7800,
        rating: 0,
        reviewCount: 0,
        sessionLengthMinutes: 45,
        payoutReady: false,
        imageUrl: "/images/coach-hill.png",
        createdAt: "2026-05-12T12:00:00.000Z",
      },
    ],
    availabilityWindows: [
      {
        id: "slot-1",
        coachId: "coach-1",
        startsAt: addDays(1, 21),
        endsAt: addDays(1, 21, 45),
      },
      {
        id: "slot-2",
        coachId: "coach-1",
        startsAt: addDays(2, 22),
        endsAt: addDays(2, 22, 45),
      },
      {
        id: "slot-3",
        coachId: "coach-2",
        startsAt: addDays(1, 23),
        endsAt: addDays(1, 23, 45),
      },
      {
        id: "slot-4",
        coachId: "coach-2",
        startsAt: addDays(3, 20),
        endsAt: addDays(3, 20, 45),
      },
      {
        id: "slot-5",
        coachId: "coach-3",
        startsAt: addDays(2, 21),
        endsAt: addDays(2, 21, 45),
      },
    ],
    bookings: [
      {
        id: "booking-1",
        guardianId: "user-guardian-1",
        coachId: "coach-1",
        playerProfileId: "player-1",
        availabilityWindowId: "slot-1",
        startsAt: addDays(1, 21),
        endsAt: addDays(1, 21, 45),
        status: "room_ready",
        priceCents: 8500,
        platformFeeCents: 1275,
        stripeCheckoutSessionId: "cs_demo_paid_seed",
        dailyRoomName: "booking-1-demo-room",
        dailyRoomUrl: "https://demo.daily.co/booking-1-demo-room",
        createdAt: "2026-05-15T12:00:00.000Z",
        updatedAt: "2026-05-15T12:02:00.000Z",
      },
    ],
    payments: [
      {
        id: "payment-1",
        bookingId: "booking-1",
        stripeCheckoutSessionId: "cs_demo_paid_seed",
        amountCents: 8500,
        platformFeeCents: 1275,
        status: "paid",
        createdAt: "2026-05-15T12:00:00.000Z",
        paidAt: "2026-05-15T12:02:00.000Z",
      },
    ],
    messages: [
      {
        id: "message-1",
        bookingId: "booking-1",
        senderId: "user-coach-1",
        body: "Please bring one side-view swing clip if you have it. We will start with balance and bat path.",
        createdAt: "2026-05-16T12:00:00.000Z",
      },
    ],
    reviews: [
      {
        id: "review-1",
        bookingId: "booking-1",
        coachId: "coach-1",
        guardianId: "user-guardian-1",
        rating: 5,
        body: "Clear cues, kind tone, and a practice plan we could use the same day.",
        createdAt: "2026-05-16T13:00:00.000Z",
      },
    ],
    auditEvents: [],
  };
}

declare global {
  var __baseballMarketplaceState: MarketplaceState | undefined;
}

export function getMarketplaceState() {
  if (
    !globalThis.__baseballMarketplaceState ||
    globalThis.__baseballMarketplaceState.coachProfiles.some((coach) =>
      coach.imageUrl.includes("source.unsplash"),
    )
  ) {
    globalThis.__baseballMarketplaceState = createInitialState();
  }

  return globalThis.__baseballMarketplaceState;
}

export function resetMarketplaceStateForTests() {
  globalThis.__baseballMarketplaceState = createInitialState();
  return globalThis.__baseballMarketplaceState;
}
