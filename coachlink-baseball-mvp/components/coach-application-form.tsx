"use client";

import { FormEvent, useState } from "react";
import { Send, Loader2 } from "lucide-react";

export function CoachApplicationForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    setStatus("loading");
    setMessage("");

    const form = new FormData(formElement);
    const body = Object.fromEntries(form.entries());

    try {
      const response = await fetch("/api/coaches/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const payload = await response.json();

      if (!response.ok) {
        const details = Array.isArray(payload.details)
          ? payload.details
              .map((detail: { path?: string; message?: string }) =>
                [detail.path, detail.message].filter(Boolean).join(": "),
              )
              .join(" ")
          : "";

        throw new Error(
          details ? `${payload.error} ${details}` : payload.error ?? "Application could not be submitted.",
        );
      }

      setStatus("success");
      setMessage("Application submitted. An admin can approve it from the review queue.");
      formElement.reset();
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Application could not be submitted.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-5 rounded-lg border border-black/10 bg-white p-5 shadow-sm">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-semibold text-stone-800">
          Full name
          <input name="name" required className="mt-2 h-11 w-full rounded-md border border-black/10 px-3 font-normal outline-none focus:border-[#1f5d3b] focus:ring-2 focus:ring-[#1f5d3b]/20" />
        </label>
        <label className="text-sm font-semibold text-stone-800">
          Email
          <input name="email" type="email" required className="mt-2 h-11 w-full rounded-md border border-black/10 px-3 font-normal outline-none focus:border-[#1f5d3b] focus:ring-2 focus:ring-[#1f5d3b]/20" />
        </label>
      </div>
      <label className="text-sm font-semibold text-stone-800">
        Coaching title
        <input name="title" required placeholder="Former college pitching coach" className="mt-2 h-11 w-full rounded-md border border-black/10 px-3 font-normal outline-none focus:border-[#1f5d3b] focus:ring-2 focus:ring-[#1f5d3b]/20" />
      </label>
      <label className="text-sm font-semibold text-stone-800">
        Bio
        <textarea name="bio" required rows={5} className="mt-2 w-full rounded-md border border-black/10 px-3 py-3 font-normal leading-6 outline-none focus:border-[#1f5d3b] focus:ring-2 focus:ring-[#1f5d3b]/20" />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-semibold text-stone-800">
          Specialties
          <input name="specialties" required placeholder="hitting, approach" className="mt-2 h-11 w-full rounded-md border border-black/10 px-3 font-normal outline-none focus:border-[#1f5d3b] focus:ring-2 focus:ring-[#1f5d3b]/20" />
        </label>
        <label className="text-sm font-semibold text-stone-800">
          Credentials
          <input name="credentials" required placeholder="USA Baseball certified" className="mt-2 h-11 w-full rounded-md border border-black/10 px-3 font-normal outline-none focus:border-[#1f5d3b] focus:ring-2 focus:ring-[#1f5d3b]/20" />
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-semibold text-stone-800">
          Years experience
          <input name="yearsExperience" type="number" min="1" max="50" defaultValue="5" required className="mt-2 h-11 w-full rounded-md border border-black/10 px-3 font-normal outline-none focus:border-[#1f5d3b] focus:ring-2 focus:ring-[#1f5d3b]/20" />
        </label>
        <label className="text-sm font-semibold text-stone-800">
          Session price
          <input name="hourlyRateDollars" type="number" min="25" max="300" defaultValue="75" required className="mt-2 h-11 w-full rounded-md border border-black/10 px-3 font-normal outline-none focus:border-[#1f5d3b] focus:ring-2 focus:ring-[#1f5d3b]/20" />
        </label>
      </div>

      {message ? (
        <p className={`rounded-md px-3 py-2 text-sm font-medium ${status === "success" ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800"}`}>
          {message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={status === "loading"}
        className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-stone-950 px-4 text-sm font-semibold text-white transition hover:bg-[#1f5d3b] disabled:cursor-not-allowed disabled:bg-stone-300"
      >
        {status === "loading" ? <Loader2 aria-hidden="true" className="size-4 animate-spin" /> : <Send aria-hidden="true" className="size-4" />}
        Submit application
      </button>
    </form>
  );
}
