import FeatureCard from "@/components/FeatureCard";
import { features } from "@/data/features";

export default function FeaturesSection() {
  return (
    <section className="bg-slate-100 px-6 py-16 xl:py-20 3xl:py-24">
      <div className="mx-auto max-w-7xl 3xl:max-w-[1600px]">
        <div className="mb-8 max-w-2xl">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-950 md:text-3xl">
            Why travelers choose us
          </h2>
          <p className="mt-2 text-base leading-7 text-slate-600">
            Built for dependable booking, secure payments, and better travel
            visibility from start to finish.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3 3xl:grid-cols-5 3xl:gap-10">
          {features.map((feature) => (
            <FeatureCard
              key={feature.title}
              {...feature}
            />
          ))}
        </div>
      </div>
    </section>
  );
}