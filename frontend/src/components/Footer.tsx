import Link from "next/link";

const links = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Carrier Rules", href: "/carrier-rules" },
  { label: "Contact Support", href: "/support" },
];

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-6 px-6 py-8 md:flex-row md:gap-8 xl:px-8 3xl:max-w-[1600px] 3xl:px-12 3xl:py-12">
        <div className="flex flex-col items-center md:items-start">
          <span className="mb-1 text-xl font-bold text-slate-950 3xl:text-2xl">
            RailLink
          </span>
          <p className="text-sm text-slate-600 3xl:text-base">
            © 2024 RailLink Infrastructure. All rights reserved.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-6 3xl:gap-12">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-xs font-bold uppercase tracking-wider text-slate-600 transition-all hover:text-slate-900 hover:underline 3xl:text-base 3xl:normal-case 3xl:tracking-wide"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}