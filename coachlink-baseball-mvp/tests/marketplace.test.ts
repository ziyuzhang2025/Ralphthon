import { beforeEach, describe, expect, it } from "vitest";
import { resetMarketplaceStateForTests } from "@/lib/mock-db";
import {
  approveCoach,
  createBookingCheckout,
  fulfillCheckoutSession,
  getBookingJoinDetails,
  getCoachById,
  listApprovedCoaches,
} from "@/lib/marketplace";
import { AccessDeniedError, NotFoundError } from "@/lib/permissions";

describe("marketplace safety and booking rules", () => {
  beforeEach(() => {
    resetMarketplaceStateForTests();
  });

  it("only exposes approved coaches to guardians", async () => {
    expect((await listApprovedCoaches()).map((coach) => coach.id)).toEqual(["coach-1", "coach-2"]);

    const guardian = resetMarketplaceStateForTests().users.find((user) => user.role === "guardian")!;

    await expect(getCoachById("coach-3", guardian)).rejects.toThrow(NotFoundError);
  });

  it("requires admin access for coach approval", async () => {
    const state = resetMarketplaceStateForTests();
    const guardian = state.users.find((user) => user.role === "guardian")!;
    const admin = state.users.find((user) => user.role === "admin")!;

    await expect(approveCoach("coach-3", guardian)).rejects.toThrow(AccessDeniedError);
    expect((await approveCoach("coach-3", admin)).status).toBe("approved");
  });

  it("creates a guardian-owned checkout and reserves the selected slot", async () => {
    const state = resetMarketplaceStateForTests();
    const guardian = state.users.find((user) => user.role === "guardian")!;

    const checkout = await createBookingCheckout(
      {
        coachId: "coach-1",
        playerProfileId: "player-1",
        availabilityWindowId: "slot-2",
      },
      guardian,
      "http://localhost:3000",
    );

    expect(checkout.mode).toBe("demo");
    expect(checkout.booking.status).toBe("pending_payment");
    expect(checkout.checkoutUrl).toContain("/checkout/success");
    expect(state.availabilityWindows.find((slot) => slot.id === "slot-2")?.bookedBookingId).toBe(
      checkout.booking.id,
    );
  });

  it("blocks coaches from creating guardian bookings", async () => {
    const state = resetMarketplaceStateForTests();
    const coachUser = state.users.find((user) => user.role === "coach")!;

    await expect(
      createBookingCheckout(
        {
          coachId: "coach-1",
          playerProfileId: "player-1",
          availabilityWindowId: "slot-2",
        },
        coachUser,
      ),
    ).rejects.toThrow(AccessDeniedError);
  });

  it("fulfills checkout idempotently and creates one video room", async () => {
    const state = resetMarketplaceStateForTests();
    const guardian = state.users.find((user) => user.role === "guardian")!;
    const checkout = await createBookingCheckout(
      {
        coachId: "coach-2",
        playerProfileId: "player-1",
        availabilityWindowId: "slot-3",
      },
      guardian,
      "http://localhost:3000",
    );

    const first = await fulfillCheckoutSession(checkout.booking.stripeCheckoutSessionId!, checkout.booking.id);
    const second = await fulfillCheckoutSession(checkout.booking.stripeCheckoutSessionId!, checkout.booking.id);

    expect(first.status).toBe("room_ready");
    expect(second.dailyRoomUrl).toBe(first.dailyRoomUrl);
    expect(
      state.auditEvents.filter(
        (event) => event.action === "video_room.created" && event.targetId === checkout.booking.id,
      ),
    ).toHaveLength(1);
  });

  it("lets the assigned coach join during the protected room window", async () => {
    const state = resetMarketplaceStateForTests();
    const coachUser = state.users.find((user) => user.id === "user-coach-1")!;
    const booking = state.bookings.find((item) => item.id === "booking-1")!;
    const joinTime = new Date(booking.startsAt);

    const details = await getBookingJoinDetails(booking.id, coachUser, joinTime);

    expect(details.roomUrl).toContain("daily.co");
    expect(details.coach.id).toBe("coach-1");
  });
});
