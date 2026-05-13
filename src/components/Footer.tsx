import Link from "next/link";

const links = [
  { label: "Privacy Policy",   href: "/privacy"      },
  { label: "Terms of Service", href: "/terms"         },
  { label: "Carrier Rules",    href: "/carrier-rules" },
  { label: "Contact Support",  href: "/support"       },
];

export default function Footer() {
  return (
    <footer className="bg-surface-container border-t border-outline-variant">
      <div className="max-w-[var(--spacing-container-max-width)] 3xl:max-w-[1600px] px-[var(--spacing-gutter)] 3xl:px-12 py-[var(--spacing-stack-lg)] 3xl:py-12 flex flex-col md:flex-row justify-between items-center mx-auto w-full">
        {/* Brand */}
        <div className="flex flex-col items-center md:items-start mb-6 md:mb-0">
          <span className="text-headline-sm 3xl:text-2xl font-bold text-primary mb-1">
            RailLink
          </span>
          <p className="text-body-sm 3xl:text-base text-on-surface-variant">
            © 2024 RailLink Infrastructure. All rights reserved.
          </p>
        </div>

        {/* Footer Links */}
        <div className="flex flex-wrap justify-center gap-[var(--spacing-stack-lg)] 3xl:gap-12">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-label-bold 3xl:text-base font-bold text-on-surface-variant tracking-wider hover:underline hover:text-primary transition-all"
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}   