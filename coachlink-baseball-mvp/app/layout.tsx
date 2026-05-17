import type { Metadata } from "next";
import { TopNav } from "@/components/top-nav";
import "./globals.css";

export const metadata: Metadata = {
  title: "CoachLink Baseball",
  description: "Book trusted online baseball coaching sessions for youth players.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="min-h-full bg-[#faf8f2] text-stone-950">
        <TopNav />
        {children}
      </body>
    </html>
  );
}
