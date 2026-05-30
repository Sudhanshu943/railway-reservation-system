"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/context/ToastContext";
import { useModal } from "@/components/modals/ModalProvider";

const NAV_LINKS = [
  { href: "/", label: "Book Tickets" },
  { href: "/pnr-status", label: "Check PNR" },
  { href: "/my-bookings", label: "My Trips" },
];

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { isLoggedIn, user, logout } = useAuth();
  const { addToast } = useToast();
  const { openLoginModal, openSignupModal } = useModal();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
    addToast("Logged out successfully", "success");
    router.push("/");
  };

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-6 xl:px-8 3xl:h-20 3xl:max-w-[1600px] 3xl:px-12">

        {/* Left — Logo */}
        <Link
          href="/"
          className="text-2xl font-bold tracking-tight text-slate-950 3xl:text-3xl"
        >
          RailLink
        </Link>

        {/* Right — Nav + Auth */}
        <div className="flex items-center gap-6 3xl:gap-10">

          {/* Nav links */}
          <nav className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map(({ href, label }) => {
              const active = isActive(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`relative px-3 py-2 text-sm font-medium transition-colors duration-150
                    ${active
                      ? "text-slate-900"
                      : "text-slate-500 hover:text-slate-900"
                    }`}
                >
                  {label}
                  {/* Active underline */}
                  <span
                    className={`absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-slate-900 transition-all duration-200
                      ${active ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0"}`}
                  />
                </Link>
              );
            })}
          </nav>

          {/* Auth area */}
          {isLoggedIn && user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-3 py-2 transition hover:border-slate-300 hover:bg-slate-50"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900">
                  <span className="text-sm font-bold text-white">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                {/* Only show name, not email */}
                <span className="hidden text-sm font-semibold text-slate-900 sm:block">
                  {user.name}
                </span>
                <span
                  className={`material-symbols-outlined text-base text-slate-400 transition-transform duration-200 ${
                    dropdownOpen ? "rotate-180" : ""
                  }`}
                >
                  expand_more
                </span>
              </button>

              {/* Dropdown */}
              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 rounded-xl border border-slate-200 bg-white py-1.5 shadow-lg">
                  {/* User info — name + email shown here */}
                  <div className="border-b border-slate-100 px-4 py-3">
                    <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                    <p className="text-xs text-slate-500 truncate">{user.email}</p>
                  </div>

                  <div className="py-1">
                    <Link
                      href="/my-bookings"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 transition-colors hover:bg-slate-50"
                    >
                      <span className="material-symbols-outlined text-base text-slate-400">confirmation_number</span>
                      My Bookings
                    </Link>
                    <Link
                      href="/pnr-status"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 transition-colors hover:bg-slate-50"
                    >
                      <span className="material-symbols-outlined text-base text-slate-400">search</span>
                      Check PNR
                    </Link>
                    {user.is_admin && (
                      <Link
                        href="/admin"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 transition-colors hover:bg-slate-50"
                      >
                        <span className="material-symbols-outlined text-base text-slate-400">admin_panel_settings</span>
                        Admin Panel
                      </Link>
                    )}
                  </div>

                  <div className="border-t border-slate-100 py-1">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 transition-colors hover:bg-red-50"
                    >
                      <span className="material-symbols-outlined text-base">logout</span>
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => openLoginModal()}
                className="rounded-lg border border-slate-900 px-5 py-2 text-sm font-bold text-slate-900 transition-all hover:bg-slate-100 active:scale-95"
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => openSignupModal()}
                className="rounded-lg bg-slate-900 px-5 py-2 text-sm font-bold text-white transition-all hover:bg-slate-800 active:scale-95"
              >
                Register
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
