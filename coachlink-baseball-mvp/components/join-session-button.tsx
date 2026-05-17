"use client";

import { useState } from "react";
import { Loader2, Video } from "lucide-react";

export function JoinSessionButton({
  bookingId,
  role = "guardian",
}: {
  bookingId: string;
  role?: "guardian" | "coach" | "admin";
}) {
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");

  async function join() {
    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch(`/api/bookings/${bookingId}/join`, {
        headers: { "x-demo-role": role },
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Session is not ready yet.");
      }

      window.open(payload.data.roomUrl, "_blank", "noopener,noreferrer");
      setStatus("idle");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Session is not ready yet.");
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={join}
        disabled={status === "loading"}
        className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#1f5d3b] px-3 text-sm font-semibold text-white transition hover:bg-[#17472d] disabled:cursor-not-allowed disabled:bg-stone-300"
      >
        {status === "loading" ? <Loader2 aria-hidden="true" className="size-4 animate-spin" /> : <Video aria-hidden="true" className="size-4" />}
        Join room
      </button>
      {message ? <p className="max-w-xs text-sm font-medium text-[#a84222]">{message}</p> : null}
    </div>
  );
}
