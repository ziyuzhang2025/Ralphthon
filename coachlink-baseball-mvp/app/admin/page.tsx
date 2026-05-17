import { AdminCoachActions } from "@/components/admin-coach-actions";
import { StatusBadge } from "@/components/status-badge";
import { formatCurrency } from "@/lib/format";
import { getAdminReviewQueue } from "@/lib/marketplace";
import { getDemoUser } from "@/lib/request-auth";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const queue = await getAdminReviewQueue(getDemoUser("admin"));

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#c4512c]">Admin operations</p>
        <h1 className="mt-2 text-4xl font-semibold text-stone-950">Coach approval queue</h1>
        <p className="mt-3 max-w-2xl leading-7 text-stone-700">
          Manual approval keeps youth-facing coach profiles hidden until credentials have been reviewed.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <section className="space-y-4">
          {queue.pendingCoaches.map((coach) => (
            <article key={coach.id} className="rounded-lg border border-black/10 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <StatusBadge status={coach.status} />
                  <h2 className="mt-3 text-2xl font-semibold text-stone-950">{coach.name}</h2>
                  <p className="mt-1 text-sm text-stone-600">{coach.title}</p>
                </div>
                <div className="rounded-md bg-[#f4f1e8] px-3 py-2 text-sm font-semibold text-stone-950">
                  {formatCurrency(coach.hourlyRateCents)}
                </div>
              </div>
              <p className="mt-4 max-w-3xl text-sm leading-6 text-stone-700">{coach.bio}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {coach.credentials.map((credential) => (
                  <span key={credential} className="rounded-md bg-[#edf6ef] px-2.5 py-1 text-xs font-semibold text-[#1f5d3b]">
                    {credential}
                  </span>
                ))}
              </div>
              <div className="mt-5">
                <AdminCoachActions coachId={coach.id} />
              </div>
            </article>
          ))}
          {queue.pendingCoaches.length === 0 ? (
            <div className="rounded-lg border border-black/10 bg-white p-8 text-center text-stone-600 shadow-sm">
              No pending coach applications.
            </div>
          ) : null}
        </section>

        <aside className="rounded-lg border border-black/10 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-stone-950">Recent audit events</h2>
          <div className="mt-4 space-y-3">
            {queue.auditEvents.length === 0 ? (
              <p className="text-sm text-stone-600">Review actions and booking events will appear here.</p>
            ) : (
              queue.auditEvents.map((event) => (
                <div key={event.id} className="rounded-md bg-[#f4f1e8] p-3 text-sm">
                  <p className="font-semibold text-stone-950">{event.action}</p>
                  <p className="mt-1 text-stone-600">{event.targetType} · {event.targetId}</p>
                </div>
              ))
            )}
          </div>
        </aside>
      </div>
    </main>
  );
}
