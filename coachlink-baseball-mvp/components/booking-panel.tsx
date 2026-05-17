"use client";

import { useMemo, useState } from "react";
import { CreditCard, Loader2 } from "lucide-react";
import { formatDateTime, formatTimeRange } from "@/lib/format";
import type { AvailabilityWindow, CoachProfile, PlayerProfile } from "@/lib/types";

interface BookingPanelProps {
  coach: CoachProfile;
  availability: AvailabilityWindow[];
  players: PlayerProfile[];
}

export function BookingPanel({ coach, availability, players }: BookingPanelProps) {
  const [slotId, setSlotId] = useState(availability[0]?.id ?? "");
  const [playerId, setPlayerId] = useState(players[0]?.id ?? "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const selectedSlot = useMemo(
    () => availability.find((slot) => slot.id === slotId),
    [availability, slotId],
  );

  async function submitBooking() {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/bookings/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          coachId: coach.id,
          playerProfileId: playerId,
          availabilityWindowId: slotId,
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to create checkout.");
      }

      window.location.href = payload.data.checkoutUrl;
    } catch (bookingError) {
      setError(bookingError instanceof Error ? bookingError.message : "Unable to book this session.");
      setIsLoading(false);
    }
  }

  return (
    <aside className="rounded-lg border border-black/10 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-stone-950">Book a live session</h2>
          <p className="mt-1 text-sm leading-6 text-stone-600">
            Guardian-owned checkout. A private video room appears after payment.
          </p>
        </div>
        <div className="rounded-md bg-[#f4f1e8] px-3 py-2 text-right text-sm font-semibold text-stone-950">
          ${coach.hourlyRateCents / 100}
        </div>
      </div>

      <label className="mt-5 block text-sm font-semibold text-stone-800" htmlFor="player">
        Player
      </label>
      <select
        id="player"
        value={playerId}
        onChange={(event) => setPlayerId(event.target.value)}
        className="mt-2 h-11 w-full rounded-md border border-black/10 bg-white px-3 text-sm outline-none focus:border-[#1f5d3b] focus:ring-2 focus:ring-[#1f5d3b]/20"
      >
        {players.map((player) => (
          <option key={player.id} value={player.id}>
            {player.firstName}, age {player.ageBand}
          </option>
        ))}
      </select>

      <fieldset className="mt-5">
        <legend className="text-sm font-semibold text-stone-800">Available times</legend>
        <div className="mt-2 grid gap-2">
          {availability.map((slot) => (
            <label
              key={slot.id}
              className="flex cursor-pointer items-center gap-3 rounded-md border border-black/10 p-3 text-sm transition has-[:checked]:border-[#1f5d3b] has-[:checked]:bg-[#edf6ef]"
            >
              <input
                type="radio"
                name="slot"
                value={slot.id}
                checked={slot.id === slotId}
                onChange={(event) => setSlotId(event.target.value)}
                className="size-4 accent-[#1f5d3b]"
              />
              <span>
                <span className="block font-semibold text-stone-950">{formatDateTime(slot.startsAt)}</span>
                <span className="text-stone-600">{formatTimeRange(slot.startsAt, slot.endsAt)}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {selectedSlot ? (
        <p className="mt-4 rounded-md bg-[#fff7e0] px-3 py-2 text-sm text-[#6f4b00]">
          Checkout reserves this slot until payment is confirmed.
        </p>
      ) : null}

      {error ? <p className="mt-4 text-sm font-medium text-red-700">{error}</p> : null}

      <button
        type="button"
        disabled={!slotId || !playerId || isLoading}
        onClick={submitBooking}
        className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-[#c4512c] px-4 text-sm font-semibold text-white transition hover:bg-[#a84222] disabled:cursor-not-allowed disabled:bg-stone-300"
      >
        {isLoading ? <Loader2 aria-hidden="true" className="size-4 animate-spin" /> : <CreditCard aria-hidden="true" className="size-4" />}
        Continue to checkout
      </button>
    </aside>
  );
}
