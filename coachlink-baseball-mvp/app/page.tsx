import { ArrowRight, CalendarCheck, ShieldCheck, Video } from "lucide-react";
import { CoachCard } from "@/components/coach-card";
import { listApprovedCoaches, listSpecialties } from "@/lib/marketplace";

export const dynamic = "force-dynamic";

export default async function Home() {
  const coaches = (await listApprovedCoaches()).slice(0, 2);
  const specialties = await listSpecialties();

  return (
    <main>
      <section className="border-b border-black/10 bg-[#f7f4ed]">
        <div className="mx-auto grid min-h-[calc(100svh-4rem)] w-full max-w-7xl items-center gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_440px] lg:px-8">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-md border border-[#1f5d3b]/20 bg-white px-3 py-2 text-sm font-semibold text-[#1f5d3b]">
              <ShieldCheck aria-hidden="true" className="size-4" />
              Guardian-led youth accounts
            </div>
            <h1 className="text-4xl font-semibold tracking-normal text-stone-950 sm:text-6xl">
              Book verified online baseball coaching.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-stone-700">
              Search approved coaches, reserve a live video lesson, pay securely, and join from a protected dashboard.
            </p>
            <form action="/coaches" className="mt-8 grid max-w-2xl gap-3 rounded-lg border border-black/10 bg-white p-3 shadow-sm sm:grid-cols-[1fr_180px_auto]">
              <label className="sr-only" htmlFor="q">
                Search coaches
              </label>
              <input
                id="q"
                name="q"
                placeholder="Search hitting, pitching, catching..."
                className="h-12 rounded-md border border-transparent bg-[#faf8f2] px-4 text-sm outline-none focus:border-[#1f5d3b] focus:ring-2 focus:ring-[#1f5d3b]/20"
              />
              <label className="sr-only" htmlFor="specialty">
                Specialty
              </label>
              <select
                id="specialty"
                name="specialty"
                className="h-12 rounded-md border border-transparent bg-[#faf8f2] px-3 text-sm capitalize outline-none focus:border-[#1f5d3b] focus:ring-2 focus:ring-[#1f5d3b]/20"
              >
                <option value="all">All specialties</option>
                {specialties.map((specialty) => (
                  <option key={specialty} value={specialty}>
                    {specialty}
                  </option>
                ))}
              </select>
              <button className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-[#c4512c] px-5 text-sm font-semibold text-white transition hover:bg-[#a84222]">
                Search
                <ArrowRight aria-hidden="true" className="size-4" />
              </button>
            </form>
            <div className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-3">
              {[
                { icon: ShieldCheck, label: "Manual coach approval" },
                { icon: CalendarCheck, label: "Reserved lesson slots" },
                { icon: Video, label: "Private video rooms" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3 rounded-md bg-white px-3 py-3 text-sm font-semibold text-stone-800 shadow-sm">
                  <item.icon aria-hidden="true" className="size-5 text-[#1f5d3b]" />
                  {item.label}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div
              className="min-h-64 rounded-lg border border-black/10 bg-cover bg-center shadow-sm"
              style={{
                backgroundImage: "url('/images/baseball-training-hero.png')",
              }}
              aria-label="Baseball coach working with a player"
            />
            <div className="grid gap-4">
              {coaches.map((coach) => (
                <CoachCard key={coach.id} coach={coach} />
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
