import Link from "next/link";
import { ShieldCheck } from "lucide-react";

const links = [
  { href: "/coaches", label: "Find coaches" },
  { href: "/dashboard/guardian", label: "Guardian dashboard" },
  { href: "/dashboard/coach", label: "Coach dashboard" },
  { href: "/admin", label: "Admin" },
];

export function TopNav() {
  return (
    <header className="sticky top-0 z-30 border-b border-black/10 bg-white/92 backdrop-blur">
      <nav className="mx-auto flex min-h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 font-semibold text-stone-950">
          <span className="grid size-9 place-items-center rounded-md bg-[#c4512c] text-white">
            <ShieldCheck aria-hidden="true" className="size-5" />
          </span>
          <span>CoachLink Baseball</span>
        </Link>
        <div className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-100 hover:text-stone-950"
            >
              {link.label}
            </Link>
          ))}
        </div>
        <Link
          href="/coaches/apply"
          className="rounded-md bg-stone-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#1f5d3b]"
        >
          Apply to coach
        </Link>
      </nav>
    </header>
  );
}
