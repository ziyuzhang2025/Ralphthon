import { CoachApplicationForm } from "@/components/coach-application-form";

export default function CoachApplyPage() {
  return (
    <main className="mx-auto grid w-full max-w-5xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[320px_1fr] lg:px-8">
      <section>
        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#c4512c]">Coach onboarding</p>
        <h1 className="mt-2 text-4xl font-semibold text-stone-950">Apply to coach online sessions</h1>
        <p className="mt-4 text-base leading-7 text-stone-700">
          New coaches enter a pending review queue. Approved profiles become visible in the marketplace.
        </p>
      </section>
      <CoachApplicationForm />
    </main>
  );
}
