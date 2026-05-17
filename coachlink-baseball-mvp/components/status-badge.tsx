import type { BookingStatus, CoachStatus } from "@/lib/types";

const labels: Record<BookingStatus | CoachStatus, string> = {
  approved: "Approved",
  cancelled: "Cancelled",
  completed: "Completed",
  draft: "Draft",
  paid: "Paid",
  pending_payment: "Pending payment",
  pending_review: "Pending review",
  rejected: "Rejected",
  room_ready: "Room ready",
};

const tones: Record<BookingStatus | CoachStatus, string> = {
  approved: "border-emerald-200 bg-emerald-50 text-emerald-800",
  cancelled: "border-stone-200 bg-stone-50 text-stone-700",
  completed: "border-blue-200 bg-blue-50 text-blue-800",
  draft: "border-stone-200 bg-stone-50 text-stone-700",
  paid: "border-amber-200 bg-amber-50 text-amber-800",
  pending_payment: "border-amber-200 bg-amber-50 text-amber-800",
  pending_review: "border-[#f0b429]/50 bg-[#fdf4d1] text-[#73510d]",
  rejected: "border-red-200 bg-red-50 text-red-800",
  room_ready: "border-emerald-200 bg-emerald-50 text-emerald-800",
};

export function StatusBadge({ status }: { status: BookingStatus | CoachStatus }) {
  return (
    <span className={`inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-semibold ${tones[status]}`}>
      {labels[status]}
    </span>
  );
}
