"use client";

import { useState } from "react";
import { Check, Loader2, X } from "lucide-react";

export function AdminCoachActions({ coachId }: { coachId: string }) {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function review(decision: "approve" | "reject") {
    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch(`/api/admin/coaches/${coachId}/${decision}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-demo-role": "admin" },
        body: decision === "reject" ? JSON.stringify({ reason: "Manual admin review rejected." }) : "{}",
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Review failed.");
      }

      setStatus("done");
      setMessage(decision === "approve" ? "Coach approved." : "Coach rejected.");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Review failed.");
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        disabled={status === "loading" || status === "done"}
        onClick={() => review("approve")}
        className="inline-flex h-10 items-center gap-2 rounded-md bg-[#1f5d3b] px-3 text-sm font-semibold text-white transition hover:bg-[#17472d] disabled:cursor-not-allowed disabled:bg-stone-300"
      >
        {status === "loading" ? <Loader2 aria-hidden="true" className="size-4 animate-spin" /> : <Check aria-hidden="true" className="size-4" />}
        Approve
      </button>
      <button
        type="button"
        disabled={status === "loading" || status === "done"}
        onClick={() => review("reject")}
        className="inline-flex h-10 items-center gap-2 rounded-md border border-red-200 bg-white px-3 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:bg-stone-100 disabled:text-stone-400"
      >
        <X aria-hidden="true" className="size-4" />
        Reject
      </button>
      {message ? (
        <span className={`text-sm font-medium ${status === "error" ? "text-red-700" : "text-[#1f5d3b]"}`}>
          {message}
        </span>
      ) : null}
    </div>
  );
}
