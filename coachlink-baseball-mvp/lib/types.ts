export type Role = "guardian" | "coach" | "admin";

export type CoachStatus = "draft" | "pending_review" | "approved" | "rejected";

export type BookingStatus =
  | "pending_payment"
  | "paid"
  | "room_ready"
  | "completed"
  | "cancelled";

export type PaymentStatus = "requires_payment" | "paid" | "failed" | "refunded";

export type AuditAction =
  | "coach.submitted"
  | "coach.approved"
  | "coach.rejected"
  | "booking.created"
  | "booking.paid"
  | "video_room.created";

export interface User {
  id: string;
  role: Role;
  name: string;
  email: string;
  stripeConnectAccountId?: string;
  createdAt: string;
}

export interface PlayerProfile {
  id: string;
  guardianId: string;
  firstName: string;
  ageBand: "8-10" | "11-13" | "14-16" | "17+";
  focusAreas: string[];
  notes?: string;
  createdAt: string;
}

export interface CoachProfile {
  id: string;
  userId: string;
  name: string;
  title: string;
  locationLabel: string;
  status: CoachStatus;
  bio: string;
  specialties: string[];
  credentials: string[];
  yearsExperience: number;
  hourlyRateCents: number;
  rating: number;
  reviewCount: number;
  sessionLengthMinutes: number;
  payoutReady: boolean;
  stripeConnectAccountId?: string;
  imageUrl: string;
  createdAt: string;
  reviewedAt?: string;
  rejectionReason?: string;
}

export interface AvailabilityWindow {
  id: string;
  coachId: string;
  startsAt: string;
  endsAt: string;
  bookedBookingId?: string;
}

export interface Booking {
  id: string;
  guardianId: string;
  coachId: string;
  playerProfileId: string;
  availabilityWindowId: string;
  startsAt: string;
  endsAt: string;
  status: BookingStatus;
  priceCents: number;
  platformFeeCents: number;
  stripeCheckoutSessionId?: string;
  dailyRoomName?: string;
  dailyRoomUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  bookingId: string;
  stripeCheckoutSessionId: string;
  amountCents: number;
  platformFeeCents: number;
  status: PaymentStatus;
  createdAt: string;
  paidAt?: string;
}

export interface Message {
  id: string;
  bookingId: string;
  senderId: string;
  body: string;
  createdAt: string;
}

export interface Review {
  id: string;
  bookingId: string;
  coachId: string;
  guardianId: string;
  rating: number;
  body: string;
  createdAt: string;
}

export interface AuditEvent {
  id: string;
  actorId: string;
  action: AuditAction;
  targetType: "coach" | "booking" | "payment";
  targetId: string;
  metadata?: Record<string, string | number | boolean | null>;
  createdAt: string;
}

export interface MarketplaceState {
  users: User[];
  playerProfiles: PlayerProfile[];
  coachProfiles: CoachProfile[];
  availabilityWindows: AvailabilityWindow[];
  bookings: Booking[];
  payments: Payment[];
  messages: Message[];
  reviews: Review[];
  auditEvents: AuditEvent[];
}

export interface CheckoutResult {
  booking: Booking;
  checkoutUrl: string;
  mode: "stripe" | "demo";
}

export interface JoinDetails {
  booking: Booking;
  coach: CoachProfile;
  roomUrl: string;
  roomName: string;
  opensAt: string;
  closesAt: string;
}
