import { CalendarClock, ShieldCheck } from "lucide-react";
import { JoinSessionButton } from "@/components/join-session-button";
import { StatusBadge } from "@/components/status-badge";
import { formatDateTime, formatTimeRange } from "@/lib/format";
import { getCoachDashboard } from "@/lib/marketplace";
import { getDemoUser } from "@/lib/request-auth";

export const dynamic = "force-dynamic";

export default async function CoachDashboardPage() {
  const dashboard = await getCoachDashboard(getDemoUser("coach"));

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#c4512c]">Coach dashboard</p>
        <h1 className="mt-2 text-4xl font-semibold text-stone-950">{dashboard.coach.name}</h1>
        <p className="mt-3 max-w-2xl leading-7 text-stone-700">
          Manage confirmed remote lessons and keep payout readiness visible.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <section className="space-y-4">
          <h2 className="flex items-center gap-2 text-xl font-semibold text-stone-950">
            <CalendarClock aria-hidden="true" className="size-5 text-[#1f5d3b]" />
            Upcoming sessions
          </h2>
          {dashboard.bookings.map(({ booking, guardian, player }) => (
            <article key={booking.id} className="rounded-lg border border-black/10 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <StatusBadge status={booking.status} />
                  <h3 className="mt-3 text-xl font-semibold text-stone-950">{player?.firstName} with {guardian?.name}</h3>
                  <p className="mt-1 text-sm text-stone-600">
                    {formatDateTime(booking.startsAt)} · {formatTimeRange(booking.startsAt, booking.endsAt)}
                  </p>
                </div>
                <JoinSessionButton bookingId={booking.id} role="coach" />
              </div>
            </article>
          ))}
        </section>

        <aside className="space-y-4">
          <section className="rounded-lg border border-black/10 bg-white p-5 shadow-sm">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-stone-950">
              <ShieldCheck aria-hidden="true" className="size-5 text-[#1f5d3b]" />
              Profile trust
            </h2>
            <div className="mt-4 space-y-3 text-sm text-stone-700">
              <p>Status: <span className="font-semibold capitalize text-stone-950">{dashboard.coach.status.replace("_", " ")}</span></p>
              <p>Payouts: <span className="font-semibold text-stone-950">{dashboard.coach.payoutReady ? "Ready" : "Needs Stripe onboarding"}</span></p>
              <p>Credentials: <span className="font-semibold text-stone-950">{dashboard.coach.credentials.length}</span></p>
            </div>
          </section>
          <section className="rounded-lg border border-black/10 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-stone-950">Open availability</h2>
            <div className="mt-4 space-y-3">
              {dashboard.availability.map((slot) => (
                <p key={slot.id} className="rounded-md bg-[#f4f1e8] p-3 text-sm font-medium text-stone-800">
                  {formatDateTime(slot.startsAt)}
                </p>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}
