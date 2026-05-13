import SearchPanel from "@/components/SearchPanel";
import TrainAnimation from "@/components/TrainAnimation";
import RouteCard from "@/components/RouteCard";
import FeatureCard from "@/components/FeatureCard";

const routes = [
  {
    badge: "Express",
    route: "London → Paris",
    price: "$45.00",
    duration: "2h 16m",
    images: [
      { src: "https://lh3.googleusercontent.com/aida-public/AB6AXuBDgknBUJjYXjX8x9FcqJL710oelxDqieA0uT298gGi7xOyuVuKVDp9vNoz6KgPrFsubndGPBEknS6cP5rp3rUQZUsUgzEJiiIaKQx77D3zGbopJ5DLW6eFrhUuyiKOQ4YhkyBB9OTzM1OgmPaZ1YP8pGDaA2Y-F6mFcBjcpdQ_HK-bXJXedT_-IN-kSCs1SzA0aHnZZ7tqD1S9AEB2s5d2YZjhVi7Ba_LeqN1vaa38AAHe1gYZeOTLitKYq-g_mUL7svaEc_nrM6VQ", alt: "Paris" },
      { src: "https://lh3.googleusercontent.com/aida-public/AB6AXuBCJbAAW6sQq4VO1Qayjvy__86711_BIRCoLXnL5nlDu0F0OFsvq2Up2DBcm6FAg0npK1U7gDt_vnfgLSfwvIF8Rt1bHEBrwHTveS4HRpOYPDQ6oqNFT446RRBDqt-w2R2x17ngLuNNVrrV1LkmggiwmFfAB0oObb56c9k82lHY12FFzGOZEYFfKqKaDsdiyIrZlEUHep8tzRVJ0bv0VBi9NHXvKWvw7IvGVKi7_WdP6pKD-799YELBKbp8Xwblk17Y8gnV6Jd9A2q0", alt: "London" },
    ],
  },
  {
    badge: "High Speed",
    route: "Berlin → Prague",
    price: "$32.00",
    duration: "4h 20m",
    images: [
      { src: "https://lh3.googleusercontent.com/aida-public/AB6AXuAiwJBNVmO6hFbSHKhOPxsRXcYz7syiSqffq7lhEVTqpZcbV66R_ZnfKPzQgxjZ48ne-Wj9knOyEzlw2oBysP8FgrNIbDus8gtQzOKZxlF6rfDpgLhLxfaPVKKY3rxWl3whZFn7O6m2nuuNCBdj9nT7iUUBqAICbxg8YGqaVtNoBxQPIpnGOB4NNlQdfZ_6KKzlz5LlLaLgL-niAEueMW_sHjTI2BIa75kPO1SEOJnyAEgZSwEHcfiaVGJYfWVwsNbdBlyut9DxL81A", alt: "Berlin" },
    ],
  },
  {
    badge: "Sleeper",
    route: "Madrid → Barcelona",
    price: "$58.00",
    duration: "2h 30m",
    images: [
      { src: "https://lh3.googleusercontent.com/aida-public/AB6AXuC2JboQmxDy6IwwZMkfiD6_CGuhXt1Cf0WVFfgHh72MFustBZDLTN4B_VX6hwz2zP830tX7zH1UnRXLvkkxCCFN7pdzOYyXL31QvxXF5Ob0DJD14IZAlNT5zzR12dV4ULBzL55ae-ejvBs1HefWb-YAdf1y9q29N1ELdeLvHg_MTm6BBepXPgogwu5bns0eElTINLTPGEQQichRlKPBbTst90ol68lXE_7yxkrhkcXhf0_uJwv55eDPz4VVTtvebFgFTxzGTROLDKyUP", alt: "Barcelona" },
    ],
  },
];

const features = [
  {
    icon: "bolt",
    title: "Instant Ticketing",
    description: "Receive your digital tickets immediately after booking. No printing required, just scan and go.",
  },
  {
    icon: "verified_user",
    title: "Secure Payments",
    description: "Infrastructure-grade security for all transactions. We support all major carriers and payment methods.",
  },
  {
    icon: "support_agent",
    title: "24/7 Monitoring",
    description: "Real-time schedule updates and 24/7 traveler support for your peace of mind throughout the journey.",
  },
];

export default function HomePage() {
  return (
    <>
      {/* ── Hero & Search ── */}
      <section className="bg-surface-container-low py-20 px-6 relative overflow-hidden">
        <div className="max-w-[var(--spacing-container-max-width)] mx-auto">
          {/* Heading */}
          <div className="max-w-[600px] mb-8">
            <h1 className="text-headline-lg font-bold text-primary tracking-tighter leading-5 mb-3 m-0">
              Reliable Travel, Timely Arrivals.
            </h1>
            <p className="text-body-md text-on-surface-variant leading-6 m-0">
              Experience infrastructure-grade rail travel. Book your next
              journey with clarity and ease.
            </p>
          </div>

          {/* Search Panel */}
          <SearchPanel />
        </div>
      </section>

      {/* ── Train Animation ── */}
      <TrainAnimation />

      {/* ── Popular Routes ── */}
      <section className="max-w-[var(--spacing-container-max-width)] mx-auto px-6 py-10">
        {/* Section header */}
        <div className="flex justify-between items-center mb-[var(--spacing-stack-lg)]">
          <h2 className="text-headline-md font-semibold text-primary m-0">
            Popular Routes
          </h2>
          <button className="bg-none border-none cursor-pointer text-primary text-label-bold font-bold flex items-center gap-1 p-0">
            View All
            <span className="material-symbols-outlined text-base">
              arrow_forward
            </span>
          </button>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-4 gap-[var(--spacing-stack-md)]">
          {routes.map((route, i) => (
            <RouteCard key={i} {...route} />
          ))}

          {/* RailPass Gold promo card */}
          <div className="bg-primary-container text-on-primary-container p-[var(--spacing-stack-md)] rounded-xl flex flex-col justify-center items-center text-center">
            <span className="material-symbols-outlined text-3xl text-on-primary-container mb-2.5">
              loyalty
            </span>
            <div className="text-headline-sm font-semibold text-on-primary mb-1.5">
              RailPass Gold
            </div>
            <p className="text-body-sm text-on-primary-container m-0 mb-4 leading-6">
              Unlimited travel across 33 countries.
            </p>
            <button className="bg-transparent text-on-primary border border-on-primary-container cursor-pointer px-4 py-1.75 rounded text-label-bold font-bold">
              Discover More
            </button>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="bg-surface-container py-16 px-6">
        <div className="max-w-[var(--spacing-container-max-width)] mx-auto grid grid-cols-3 gap-12">
          {features.map((f, i) => (
            <FeatureCard key={i} {...f} />
          ))}
        </div>
      </section>
    </>
  );
}
