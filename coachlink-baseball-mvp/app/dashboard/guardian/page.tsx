import Link from "next/link";
import { CalendarCheck, MessageSquare } from "lucide-react";
import { JoinSessionButton } from "@/components/join-session-button";
import { StatusBadge } from "@/components/status-badge";
import { formatDateTime, formatTimeRange } from "@/lib/format";
import { getGuardianDashboard } from "@/lib/marketplace";
import { getDemoUser } from "@/lib/request-auth";

export const dynamic = "force-dynamic";

export default async function GuardianDashboardPage() {
  const dashboard = await getGuardianDashboard(getDemoUser("guardian"));

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#c4512c]">Guardian dashboard</p>
          <h1 className="mt-2 text-4xl font-semibold text-stone-950">Welcome, {dashboard.user.name}</h1>
        </div>
        <Link href="/coaches" className="rounded-md bg-stone-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#1f5d3b]">
          Book another session
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <section className="space-y-4">
          <h2 className="flex items-center gap-2 text-xl font-semibold text-stone-950">
            <CalendarCheck aria-hidden="true" className="size-5 text-[#1f5d3b]" />
            Bookings
          </h2>
          {dashboard.bookings.map(({ booking, coach, player }) => (
            <article key={booking.id} className="rounded-lg border border-black/10 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <StatusBadge status={booking.status} />
                  <h3 className="mt-3 text-xl font-semibold text-stone-950">{coach?.name}</h3>
                  <p className="mt-1 text-sm text-stone-600">
                    {player?.firstName} · {formatDateTime(booking.startsAt)} · {formatTimeRange(booking.startsAt, booking.endsAt)}
                  </p>
                </div>
                <JoinSessionButton bookingId={booking.id} role="guardian" />
              </div>
            </article>
          ))}
        </section>

        <aside className="space-y-4">
          <section className="rounded-lg border border-black/10 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-stone-950">Players</h2>
            <div className="mt-4 space-y-3">
              {dashboard.players.map((player) => (
                <div key={player.id} className="rounded-md bg-[#f4f1e8] p-3">
                  <p className="font-semibold text-stone-950">{player.firstName}</p>
                  <p className="mt-1 text-sm text-stone-600">Age {player.ageBand} · {player.focusAreas.join(", ")}</p>
                </div>
              ))}
            </div>
          </section>
          <section className="rounded-lg border border-black/10 bg-white p-5 shadow-sm">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-stone-950">
              <MessageSquare aria-hidden="true" className="size-5 text-[#c4512c]" />
              Session messages
            </h2>
            <div className="mt-4 space-y-3">
              {dashboard.messages.map((message) => (
                <p key={message.id} className="rounded-md bg-[#fff7e0] p-3 text-sm leading-6 text-stone-700">
                  {message.body}
                </p>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}
