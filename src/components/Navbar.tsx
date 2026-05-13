import Link from "next/link";

export default function Navbar() {
  return (
    <header className="bg-surface border-b border-outline-variant sticky top-0 z-50">
      <div className="max-w-[var(--spacing-container-max-width)] 3xl:max-w-[1600px] px-[var(--spacing-gutter)] 3xl:px-12 flex justify-between items-center h-16 3xl:h-20 mx-auto w-full">
        {/* Logo */}
        <span className="text-headline-md 3xl:text-3xl font-bold text-primary">
          RailLink
        </span>

        {/* Nav Links */}
        <nav className="hidden md:flex items-center gap-[var(--spacing-stack-lg)] 3xl:gap-12">
          <Link
            href="/"
            className="text-label-md 3xl:text-base font-medium text-primary border-b-2 border-primary pb-1"
          >
            Search
          </Link>
          <Link
            href="/bookings"
            className="text-label-md 3xl:text-base font-medium text-on-surface-variant hover:text-primary transition-colors duration-200"
          >
            My Bookings
          </Link>
          <Link
            href="/schedules"
            className="text-label-md 3xl:text-base font-medium text-on-surface-variant hover:text-primary transition-colors duration-200"
          >
            Schedules
          </Link>
        </nav>

        {/* Auth Buttons */}
        <div className="flex items-center gap-[var(--spacing-stack-md)] 3xl:gap-6">
          <Link
            href="/login"
            className="text-label-md 3xl:text-base font-medium text-on-surface-variant no-underline hover:text-primary transition-all"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="bg-primary text-on-primary px-[var(--spacing-stack-md)] 3xl:px-6 py-2 3xl:py-3 rounded text-label-md 3xl:text-base font-medium no-underline inline-block hover:opacity-90 active:scale-95 transition-all"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </header>
  );
}