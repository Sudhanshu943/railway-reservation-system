import SearchPanel from "@/components/SearchPanel";

export default function HeroSection() {
  return (
    <section className="hero-gradient relative overflow-hidden px-4 py-16 md:px-6 3xl:py-24">
      <div className="mx-auto max-w-[1280px]">
        <div className="mx-auto mb-8 max-w-[720px] text-center 3xl:mb-12">
          <h1 className="mb-4 text-display-lg-mobile font-bold text-primary md:text-display-lg">
            India&apos;s Next-Gen Travel Partner.
          </h1>
          <p className="mb-8 text-body-lg text-on-surface-variant">
            Experience lightning-fast bookings, AI-powered seat predictions, and
            instant refunds for your rail journeys across Bharat.
          </p>
          <div className="mx-auto flex w-fit items-center gap-3 rounded-full border border-outline-variant bg-white/70 px-4 py-2 shadow-sm backdrop-blur-md">
            <span className="material-symbols-outlined text-primary">
              verified_user
            </span>
            <span className="text-label-md text-on-surface">
              IRCTC Authorized Partner Agency
            </span>
          </div>
        </div>

        <div className="mx-auto max-w-4xl">
          <SearchPanel />
        </div>
      </div>
    </section>
  );
}