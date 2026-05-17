import Link from "next/link";
import { ArrowRight, UserRoundPlus } from "lucide-react";

export default function GuardianOnboardingPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="rounded-lg border border-black/10 bg-white p-6 shadow-sm">
        <div className="mb-5 inline-flex size-12 items-center justify-center rounded-md bg-[#edf6ef] text-[#1f5d3b]">
          <UserRoundPlus aria-hidden="true" className="size-6" />
        </div>
        <h1 className="text-4xl font-semibold text-stone-950">Guardian onboarding</h1>
        <p className="mt-3 max-w-2xl leading-7 text-stone-700">
          MVP accounts are guardian-led. Youth players are represented by lightweight player profiles used only for booking context.
        </p>
        <form className="mt-8 grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-semibold text-stone-800">
            Player first name
            <input defaultValue="Leo" className="mt-2 h-11 w-full rounded-md border border-black/10 px-3 font-normal outline-none focus:border-[#1f5d3b] focus:ring-2 focus:ring-[#1f5d3b]/20" />
          </label>
          <label className="text-sm font-semibold text-stone-800">
            Age band
            <select defaultValue="11-13" className="mt-2 h-11 w-full rounded-md border border-black/10 px-3 font-normal outline-none focus:border-[#1f5d3b] focus:ring-2 focus:ring-[#1f5d3b]/20">
              <option>8-10</option>
              <option>11-13</option>
              <option>14-16</option>
              <option>17+</option>
            </select>
          </label>
          <label className="sm:col-span-2 text-sm font-semibold text-stone-800">
            Focus areas
            <input defaultValue="hitting, fielding" className="mt-2 h-11 w-full rounded-md border border-black/10 px-3 font-normal outline-none focus:border-[#1f5d3b] focus:ring-2 focus:ring-[#1f5d3b]/20" />
          </label>
        </form>
        <Link href="/coaches" className="mt-6 inline-flex h-11 items-center gap-2 rounded-md bg-[#c4512c] px-4 text-sm font-semibold text-white transition hover:bg-[#a84222]">
          Find a coach
          <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
      </section>
    </main>
  );
}
