import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import type { CoachProfile } from "@/lib/types";

export function CoachCard({ coach }: { coach: CoachProfile }) {
  return (
    <article className="grid gap-4 rounded-lg border border-black/10 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:grid-cols-[112px_1fr]">
      <div
        className="h-28 rounded-md bg-cover bg-center sm:h-auto sm:min-h-full"
        style={{ backgroundImage: `url("${coach.imageUrl}")` }}
        aria-hidden="true"
      />
      <div className="flex min-w-0 flex-col gap-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-stone-950">{coach.name}</h3>
            <p className="mt-1 text-sm text-stone-600">{coach.title}</p>
          </div>
          <div className="rounded-md bg-[#f4f1e8] px-3 py-2 text-right">
            <p className="text-sm font-semibold text-stone-950">{formatCurrency(coach.hourlyRateCents)}</p>
            <p className="text-xs text-stone-600">{coach.sessionLengthMinutes} min</p>
          </div>
        </div>
        <p className="line-clamp-2 text-sm leading-6 text-stone-700">{coach.bio}</p>
        <div className="flex flex-wrap gap-2">
          {coach.specialties.slice(0, 3).map((specialty) => (
            <span
              key={specialty}
              className="rounded-md border border-[#1f5d3b]/20 bg-[#edf6ef] px-2.5 py-1 text-xs font-semibold capitalize text-[#1f5d3b]"
            >
              {specialty}
            </span>
          ))}
        </div>
        <div className="mt-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-1 text-sm text-stone-700">
            <Star aria-hidden="true" className="size-4 fill-[#f0b429] text-[#f0b429]" />
            <span className="font-semibold">{coach.rating.toFixed(1)}</span>
            <span>({coach.reviewCount})</span>
          </div>
          <Link
            href={`/coaches/${coach.id}`}
            className="inline-flex items-center gap-2 rounded-md bg-stone-950 px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#c4512c]"
          >
            View
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}
