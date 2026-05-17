import { Search } from "lucide-react";
import { CoachCard } from "@/components/coach-card";
import { listApprovedCoaches, listSpecialties } from "@/lib/marketplace";

export const dynamic = "force-dynamic";

export default async function CoachesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; specialty?: string }>;
}) {
  const params = await searchParams;
  const coaches = await listApprovedCoaches({
    query: params.q,
    specialty: params.specialty,
  });
  const specialties = await listSpecialties();

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
        <aside>
          <form className="rounded-lg border border-black/10 bg-white p-4 shadow-sm">
            <h1 className="text-2xl font-semibold text-stone-950">Find a coach</h1>
            <p className="mt-2 text-sm leading-6 text-stone-600">
              Approved remote coaches only. Use demo data to book a test lesson.
            </p>
            <label className="mt-5 block text-sm font-semibold text-stone-800" htmlFor="q">
              Search
            </label>
            <div className="mt-2 flex h-11 items-center gap-2 rounded-md border border-black/10 bg-white px-3 focus-within:border-[#1f5d3b] focus-within:ring-2 focus-within:ring-[#1f5d3b]/20">
              <Search aria-hidden="true" className="size-4 text-stone-500" />
              <input
                id="q"
                name="q"
                defaultValue={params.q}
                placeholder="Pitching, hitting..."
                className="min-w-0 flex-1 bg-transparent text-sm outline-none"
              />
            </div>
            <label className="mt-4 block text-sm font-semibold text-stone-800" htmlFor="specialty">
              Specialty
            </label>
            <select
              id="specialty"
              name="specialty"
              defaultValue={params.specialty ?? "all"}
              className="mt-2 h-11 w-full rounded-md border border-black/10 bg-white px-3 text-sm capitalize outline-none focus:border-[#1f5d3b] focus:ring-2 focus:ring-[#1f5d3b]/20"
            >
              <option value="all">All specialties</option>
              {specialties.map((specialty) => (
                <option key={specialty} value={specialty}>
                  {specialty}
                </option>
              ))}
            </select>
            <button className="mt-5 h-11 w-full rounded-md bg-stone-950 px-4 text-sm font-semibold text-white transition hover:bg-[#1f5d3b]">
              Apply filters
            </button>
          </form>
        </aside>

        <section>
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#c4512c]">Coach directory</p>
              <h2 className="mt-1 text-3xl font-semibold text-stone-950">{coaches.length} approved coaches</h2>
            </div>
          </div>
          <div className="grid gap-4 xl:grid-cols-2">
            {coaches.map((coach) => (
              <CoachCard key={coach.id} coach={coach} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
