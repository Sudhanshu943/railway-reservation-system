import RouteCard from "@/components/RouteCard";
import { routes } from "@/data/routes";

export default function RoutesSection() {
  return (
    <section className="max-w-[var(--spacing-container-max-width)] 3xl:max-w-[1600px] mx-auto px-6 py-10 3xl:py-16">
      {/* Section header */}
      <div className="flex justify-between items-center mb-[var(--spacing-stack-lg)] 3xl:mb-12">
        <h2 className="text-headline-md 3xl:text-4xl font-semibold text-primary m-0">
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
      <div className="grid grid-cols-4 3xl:grid-cols-6 gap-[var(--spacing-stack-md)] 3xl:gap-6">
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
  );
}
