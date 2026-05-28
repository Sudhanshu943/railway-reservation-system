"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/context/ToastContext";

export default function Navbar() {
  const router = useRouter();
  const { isLoggedIn, user, logout } = useAuth();
  const { addToast } = useToast();

  const handleLogout = () => {
    logout();
    addToast("Logged out successfully", "success");
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-6 xl:px-8 3xl:h-20 3xl:max-w-[1600px] 3xl:px-12">
        <div className="flex items-center gap-8 3xl:gap-12">
          <Link
            href="/"
            className="text-2xl font-bold tracking-tight text-slate-950 3xl:text-3xl"
          >
            RailLink
          </Link>

          <nav className="hidden items-center gap-6 md:flex 3xl:gap-12">
            <Link
              href="/book-tickets"
              className="border-b-2 border-slate-900 pb-1 text-sm font-bold text-slate-900"
            >
              Book Tickets
            </Link>
            <Link
              href="/pnr-status"
              className="text-sm font-medium text-slate-600 transition-colors duration-200 hover:text-slate-900"
            >
              Check PNR
            </Link>
            <Link
              href="/live-status"
              className="text-sm font-medium text-slate-600 transition-colors duration-200 hover:text-slate-900"
            >
              Live Status
            </Link>
            <Link
              href="/schedule"
              className="text-sm font-medium text-slate-600 transition-colors duration-200 hover:text-slate-900"
            >
              Schedule
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4 3xl:gap-6">
          {isLoggedIn && user ? (
            <>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200">
                  <span className="text-sm font-bold text-slate-700">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex flex-col gap-0">
                  <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                  <p className="text-xs text-slate-600">{user.email}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg bg-red-600 px-6 py-2 text-sm font-bold text-white transition-all hover:bg-red-700 active:scale-95 3xl:py-3"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => router.push("/login")}
                className="rounded-lg border border-slate-900 px-6 py-2 text-sm font-bold text-slate-900 transition-all hover:bg-slate-100 active:scale-95"
              >
                Login
              </button>

              <button
                type="button"
                onClick={() => router.push("/signup")}
                className="rounded-lg bg-slate-900 px-6 py-2 text-sm font-bold text-white transition-all hover:bg-slate-800 active:scale-95 3xl:py-3"
              >
                Register
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}