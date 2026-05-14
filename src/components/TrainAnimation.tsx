export default function TrainAnimation() {
  return (
    <section className="relative w-full overflow-hidden bg-surface-container-low border-b border-outline-variant py-10">
      {/* ── Track Line ── */}
      <div className="absolute left-0 w-full bg-outline-variant opacity-30" style={{ bottom: "16px", height: "2px" }} />

      {/* ── Train Container ── */}
      <div className="train-animation-container relative flex items-center h-12">
        <div className="animate-train flex items-center">
          <div className="flex items-end">

            {/* Front Car */}
            <div
              className="relative flex items-center justify-end bg-primary "
              style={{
                width: "96px",
                height: "24px",
              }}
            >
              
            </div>

            {/* Middle Car 1 */}
            <div
              className="bg-primary"
              style={{
                width: "80px",
                height: "24px",
                borderLeft: "1px solid var(--color-primary-container)",
                margin: "0 2px",
              }}
            />

            {/* Middle Car 2 */}
            <div
              className="bg-primary"
              style={{
                width: "80px",
                height: "24px",
                borderLeft: "1px solid var(--color-primary-container)",
                margin: "0 2px",
              }}
            />

            {/* Middle Car 3 */}
            <div
              className="bg-primary"
              style={{
                width: "80px",
                height: "24px",
                borderLeft: "1px solid var(--color-primary-container)",
                margin: "0 2px",
              }}
            />

            {/* Rear Car */}
            <div
              className="relative flex items-center justify-end bg-primary rounded-r-full pr-2"
              style={{
                width: "96px",
                height: "24px",
              }}
            >
            {/* Headlight */}
              <div
                className="bg-on-primary opacity-50 rounded-full"
                style={{
                  width: "16px",
                  height: "4px",
                  marginBottom: "2px",
                }}
              />
              </div>

          </div>
        </div>
      </div>
    </section>
  );
}