import Image from "next/image";

export default function FilterSidebar() {
  return (
    <aside className="hidden md:block md:col-span-3 sticky top-24 3xl:top-32">
      <div className="flex flex-col gap-[var(--spacing-stack-lg)] 3xl:gap-8">
        {/* Quick Filters */}
        <div className="bg-surface-container-low border border-outline-variant p-[var(--spacing-stack-md)] 3xl:p-6 rounded-xl">
          <h3 className="text-headline-sm 3xl:text-lg font-semibold mb-[var(--spacing-stack-md)] 3xl:mb-4 m-0">
            Quick Filters
          </h3>
          <div className="flex flex-col gap-[var(--spacing-stack-md)] 3xl:gap-4">
            <label className="flex items-center gap-[var(--spacing-stack-sm)] cursor-pointer m-0">
              <input
                type="checkbox"
                defaultChecked
                className="rounded-sm accent-primary border-outline"
              />
              <span className="text-body-sm text-on-surface">
                AC Classes Only
              </span>
            </label>
            <label className="flex items-center gap-[var(--spacing-stack-sm)] cursor-pointer m-0">
              <input
                type="checkbox"
                className="rounded-sm accent-primary border-outline"
              />
              <span className="text-body-sm text-on-surface">
                Superfast Trains
              </span>
            </label>
            <label className="flex items-center gap-[var(--spacing-stack-sm)] cursor-pointer m-0">
              <input
                type="checkbox"
                className="rounded-sm accent-primary border-outline"
              />
              <span className="text-body-sm text-on-surface">
                Depart Before 12 PM
              </span>
            </label>
          </div>
        </div>

        {/* Premium Lounge Banner */}
        <div className="relative rounded-xl overflow-hidden aspect-[4/3] cursor-pointer group">
          <Image
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBKC3TJHvgTGjrAMlQugcuv7XYDvE4B7ZNyi4vHU-oMExc_UrxDeZwRi5YndwJ6bT9l3ebL-ciM6VoHFlVNFaLBy_U00aWxGlMtqCzetg9ZbO9xSLqiSN2Vguy5kt2uRTptWqUtOr-KD2G-7OSrFHOxKfj3xJ8Eu7M1WcW-Ug6qnApoLIqeOtg77k37SGTuEt9-O6XF9YqLpay9INSuLAcebVHs0Wx6uGGh3wfP8mHr-9zMzIqw-mjbPMQ1dyOp4YbVoai-QbwiHTpH"
            alt="Premium Lounge Access"
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-primary opacity-40 flex items-center justify-center">
            <span className="text-label-bold font-bold border border-white text-white px-4 py-2">
              Premium Lounge Access
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
