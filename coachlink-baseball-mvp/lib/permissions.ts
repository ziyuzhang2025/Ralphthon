import type { Booking, CoachProfile, Role, User } from "@/lib/types";

export class AccessDeniedError extends Error {
  constructor(message = "You do not have access to this resource.") {
    super(message);
    this.name = "AccessDeniedError";
  }
}

export class NotFoundError extends Error {
  constructor(message = "Resource not found.") {
    super(message);
    this.name = "NotFoundError";
  }
}

export class ValidationError extends Error {
  constructor(message = "The submitted data is invalid.") {
    super(message);
    this.name = "ValidationError";
  }
}

export function assertRole(user: User | undefined, roles: Role[]) {
  if (!user || !roles.includes(user.role)) {
    throw new AccessDeniedError();
  }
}

export function canViewCoachProfile(user: User | undefined, coach: CoachProfile) {
  if (coach.status === "approved") {
    return true;
  }

  if (!user) {
    return false;
  }

  return user.role === "admin" || user.id === coach.userId;
}

export function canManageCoachReview(user: User | undefined) {
  return user?.role === "admin";
}

export function canCreateBooking(user: User | undefined) {
  return user?.role === "guardian";
}

export function canJoinBooking(user: User | undefined, booking: Booking, coach?: CoachProfile) {
  if (!user) {
    return false;
  }

  return (
    user.role === "admin" ||
    user.id === booking.guardianId ||
    user.id === coach?.userId
  );
}

export function isJoinWindowOpen(booking: Booking, now = new Date()) {
  const opensAt = new Date(booking.startsAt).getTime() - 15 * 60 * 1000;
  const closesAt = new Date(booking.endsAt).getTime() + 90 * 60 * 1000;
  const current = now.getTime();

  return current >= opensAt && current <= closesAt;
}
