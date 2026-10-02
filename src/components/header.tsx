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
    <header className="page-header">
      <div>
        <h1 className="page-header__title">{title}</h1>
        <p className="page-header__subtitle">{subtitle}</p>
      </div>

      <div className="page-header__date">
        <CalendarDays size={16} />
        <time suppressHydrationWarning>{today}</time>
      </div>
    </header>
  );
}
