interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
}

export default function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="flex flex-col gap-[var(--spacing-stack-sm)] 3xl:gap-4">
      {/* Icon Box */}
      <div className="flex items-center justify-center w-12 3xl:w-16 h-12 3xl:h-16 bg-primary rounded mb-2 3xl:mb-4">
        <span className="material-symbols-outlined text-on-primary text-2xl 3xl:text-3xl">
          {icon}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-headline-sm 3xl:text-lg font-semibold text-primary m-0">
        {title}
      </h3>

      {/* Description */}
      <p className="text-body-md 3xl:text-lg text-on-surface-variant leading-6 3xl:leading-7 m-0">
        {description}
      </p>
    </div>
  );
}