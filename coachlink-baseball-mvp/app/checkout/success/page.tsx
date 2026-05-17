import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import { formatDateTime } from "@/lib/format";
import { fulfillCheckoutSession } from "@/lib/marketplace";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ bookingId?: string; session_id?: string }>;
}) {
  const params = await searchParams;
  const booking = params.session_id
    ? await fulfillCheckoutSession(params.session_id, params.bookingId)
    : undefined;

  return (
    <main className="mx-auto grid min-h-[calc(100svh-4rem)] w-full max-w-3xl place-items-center px-4 py-8 sm:px-6 lg:px-8">
      <section className="w-full rounded-lg border border-black/10 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto grid size-14 place-items-center rounded-md bg-emerald-50 text-emerald-700">
          <CheckCircle2 aria-hidden="true" className="size-8" />
        </div>
        <h1 className="mt-5 text-3xl font-semibold text-stone-950">Session booked</h1>
        <p className="mt-3 text-stone-700">
          Payment fulfillment created the private video room and updated the booking.
        </p>
        {booking ? (
          <div className="mx-auto mt-6 max-w-md rounded-md bg-[#f4f1e8] p-4 text-left">
            <StatusBadge status={booking.status} />
            <p className="mt-3 font-semibold text-stone-950">{formatDateTime(booking.startsAt)}</p>
            <p className="mt-1 text-sm text-stone-600">Booking ID: {booking.id}</p>
          </div>
        ) : null}
        <Link href="/dashboard/guardian" className="mt-6 inline-flex h-11 items-center justify-center rounded-md bg-[#1f5d3b] px-4 text-sm font-semibold text-white transition hover:bg-[#17472d]">
          Open dashboard
        </Link>
      </section>
    </main>
  );
}
