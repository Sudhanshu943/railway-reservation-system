interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
}

export default function FeatureCard({
  icon,
  title,
  description,
}: FeatureCardProps) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-white xl:h-14 xl:w-14">
        <span className="material-symbols-outlined text-2xl">
          {icon}
        </span>
      </div>

      <h3 className="mb-2 text-xl font-semibold tracking-tight text-slate-950">
        {title}
      </h3>

      <p className="text-sm leading-6 text-slate-600 xl:text-base xl:leading-7">
        {description}
      </p>
    </article>
  );
}