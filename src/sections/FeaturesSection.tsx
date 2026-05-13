import FeatureCard from "@/components/FeatureCard";
import { features } from "@/data/features";

export default function FeaturesSection() {
  return (
    <section className="bg-surface-container py-16 3xl:py-24 px-6">
      <div className="max-w-[var(--spacing-container-max-width)] 3xl:max-w-[1600px] mx-auto grid grid-cols-3 3xl:grid-cols-5 gap-12 3xl:gap-16">
        {features.map((f, i) => (
          <FeatureCard key={i} {...f} />
        ))}
      </div>
    </section>
  );
}
