import SearchPanel from "@/components/SearchPanel";

export default function HeroSection() {
  return (
    <section className="hero-gradient py-16 px-6 3xl:py-24 relative overflow-hidden">
      <div className="max-w-[var(--spacing-container-max-width)] 3xl:max-w-[1600px] mx-auto">
        {/* Heading */}
        <div className="max-w-[600px] 3xl:max-w-[800px] mb-8 3xl:mb-12">
          <h1 className="text-headline-lg 3xl:text-5xl font-bold text-on-primary tracking-tighter leading-5 3xl:leading-tight mb-3 3xl:mb-6 m-0">
            Reliable Travel, Timely Arrivals.
          </h1>
          <p className="text-body-md 3xl:text-xl text-inverse-on-surface leading-6 3xl:leading-8 m-0">
            Experience infrastructure-grade rail travel. Book your next
            journey with clarity and ease.
          </p>
        </div>

        {/* Search Panel */}
        <SearchPanel />
      </div>
    </section>
  );
}
