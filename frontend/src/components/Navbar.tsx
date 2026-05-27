"use client";

import Link from "next/link";
import { useModal } from "./modals/ModalProvider";

export default function Navbar() {
  const { openLoginModal, openSignupModal } = useModal();

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
          <button
            type="button"
            onClick={openLoginModal}
            className="rounded-lg border border-slate-900 px-6 py-2 text-sm font-bold text-slate-900 transition-all hover:bg-slate-100 active:scale-95"
          >
            Login
          </button>

          <button
            type="button"
            onClick={openSignupModal}
            className="rounded-lg bg-slate-900 px-6 py-2 text-sm font-bold text-white transition-all hover:bg-slate-800 active:scale-95 3xl:py-3"
          >
            Register
          </button>
        </div>
      </div>
    </header>
  );
}