import { Award, Clock, Star } from "lucide-react";
import { BookingPanel } from "@/components/booking-panel";
import { StatusBadge } from "@/components/status-badge";
import { formatCurrency } from "@/lib/format";
import { getMarketplaceState } from "@/lib/mock-db";
import { getCoachById, getOpenAvailability } from "@/lib/marketplace";
import { getDemoUser } from "@/lib/request-auth";

export const dynamic = "force-dynamic";

export default async function CoachProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const guardian = getDemoUser("guardian");
  const coach = await getCoachById(id, guardian);
  const availability = getOpenAvailability(coach.id);
  const players = getMarketplaceState().playerProfiles.filter((player) => player.guardianId === guardian.id);

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <section className="min-w-0">
          <div className="grid gap-6 rounded-lg border border-black/10 bg-white p-5 shadow-sm md:grid-cols-[240px_1fr]">
            <div
              className="min-h-72 rounded-md bg-cover bg-center"
              style={{ backgroundImage: `url("${coach.imageUrl}")` }}
              aria-label={`${coach.name} profile photo`}
            />
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <StatusBadge status={coach.status} />
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-stone-700">
                  <Star aria-hidden="true" className="size-4 fill-[#f0b429] text-[#f0b429]" />
                  {coach.rating.toFixed(1)} ({coach.reviewCount} reviews)
                </span>
              </div>
              <h1 className="mt-4 text-4xl font-semibold tracking-normal text-stone-950">{coach.name}</h1>
              <p className="mt-2 text-lg text-stone-700">{coach.title}</p>
              <p className="mt-5 max-w-3xl text-base leading-7 text-stone-700">{coach.bio}</p>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-md bg-[#f4f1e8] p-3">
                  <p className="text-sm text-stone-600">Session</p>
                  <p className="mt-1 font-semibold text-stone-950">{coach.sessionLengthMinutes} minutes</p>
                </div>
                <div className="rounded-md bg-[#f4f1e8] p-3">
                  <p className="text-sm text-stone-600">Price</p>
                  <p className="mt-1 font-semibold text-stone-950">{formatCurrency(coach.hourlyRateCents)}</p>
                </div>
                <div className="rounded-md bg-[#f4f1e8] p-3">
                  <p className="text-sm text-stone-600">Experience</p>
                  <p className="mt-1 font-semibold text-stone-950">{coach.yearsExperience} years</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <section className="rounded-lg border border-black/10 bg-white p-5 shadow-sm">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-stone-950">
                <Award aria-hidden="true" className="size-5 text-[#c4512c]" />
                Credentials
              </h2>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-stone-700">
                {coach.credentials.map((credential) => (
                  <li key={credential}>{credential}</li>
                ))}
              </ul>
            </section>
            <section className="rounded-lg border border-black/10 bg-white p-5 shadow-sm">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-stone-950">
                <Clock aria-hidden="true" className="size-5 text-[#1f5d3b]" />
                Focus areas
              </h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {coach.specialties.map((specialty) => (
                  <span key={specialty} className="rounded-md bg-[#edf6ef] px-3 py-1.5 text-sm font-semibold capitalize text-[#1f5d3b]">
                    {specialty}
                  </span>
                ))}
              </div>
            </section>
          </div>
        </section>

        <BookingPanel coach={coach} availability={availability} players={players} />
      </div>
    </main>
  );
}
