import { CalendarDays } from "lucide-react";

// Server component: no "use client" needed
export default function Header({
  title = "Waitlist overview",
  subtitle = "Everyone who's signed up so far, split by role.",
}) {
  const today = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <>
      <div className="h-[124px] shrink-0 md:h-[112px]" aria-hidden="true" />
      <header className="fixed inset-x-0 top-14 z-20 flex min-h-[124px] items-center justify-between gap-4 border-b border-white/[0.07] bg-[#0b0e12] px-4 py-4 md:left-[240px] md:top-0 md:min-h-[112px] md:px-9 md:py-5">
      <div className="min-w-0">
        <h1 className="page-header__title text-xl font-bold text-[#f2f4f7] md:text-2xl">{title}</h1>
        <p className="page-header__subtitle mt-1 text-sm text-[#a3acba]">{subtitle}</p>
      </div>

      <div className="page-header__date hidden shrink-0 items-center gap-2 text-sm text-[#a3acba] sm:flex">
        <CalendarDays size={16} />
        <time suppressHydrationWarning>{today}</time>
      </div>
      </header>
    </>
  );
}
