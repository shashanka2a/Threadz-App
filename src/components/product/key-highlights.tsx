import Image from "next/image";

const HIGHLIGHTS = [
  {
    title: "Premium Fabric",
    description: "Crafted from pure cotton for a soft, natural feel.",
    objectPosition: "48% 35%",
    icon: "fabric" as const,
  },
  {
    title: "Neat Stitching",
    description: "Durable, even stitching for long-lasting wear.",
    objectPosition: "50% 12%",
    icon: "stitching" as const,
  },
  {
    title: "Soft Hand Feel",
    description: "Smooth, gentle texture that feels great on skin.",
    objectPosition: "52% 72%",
    icon: "hand" as const,
  },
  {
    title: "Breathable",
    description: "Allows air to flow, keeping you cool and fresh.",
    objectPosition: "45% 55%",
    icon: "breathable" as const,
  },
] as const;

type KeyHighlightsProps = {
  imageSrc: string;
};

function HighlightIcon({ type }: { type: (typeof HIGHLIGHTS)[number]["icon"] }) {
  const className = "h-5 w-5 text-neutral-900";

  if (type === "fabric") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
        <path
          d="M12 3c-2 2.5-4 4.5-4 7a4 4 0 1 0 8 0c0-2.5-2-4.5-4-7Z"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M8 14c-1.5 1-2.5 2.5-2.5 4.5M16 14c1.5 1 2.5 2.5 2.5 4.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (type === "stitching") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
        <path
          d="M5 19L19 5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray="3 3"
        />
      </svg>
    );
  }

  if (type === "hand") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
        <path
          d="M8 11V8.5a1.5 1.5 0 1 1 3 0V11M11 11V7.5a1.5 1.5 0 1 1 3 0V11M14 11V8.5a1.5 1.5 0 1 1 3 0V12c0 3-2 6-6 6.5-2.5.3-4.5-1-5.5-3"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M8 6c0-1.5 1-2.5 2.5-2.5M16 6c0-1.5-1-2.5-2.5-2.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M7 9c1.5-2 3.5-2 5 0s3.5 2 5 0M7 13c1.5-2 3.5-2 5 0s3.5 2 5 0"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M9 5V3M12 5V2M15 5V3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function KeyHighlights({ imageSrc }: KeyHighlightsProps) {
  return (
    <section className="mt-16">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-serif mb-2">Key Highlights</h2>
        <p className="text-neutral-600">Every detail, crafted for everyday comfort.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
        {HIGHLIGHTS.map((item) => (
          <div key={item.title} className="flex flex-col items-center text-center px-2">
            <div className="relative w-full max-w-[240px] mx-auto mb-8">
              <div className="aspect-square rounded-xl overflow-hidden bg-neutral-100">
                <Image
                  src={imageSrc}
                  alt={item.title}
                  width={480}
                  height={480}
                  sizes="(max-width: 640px) 80vw, (max-width: 1024px) 40vw, 240px"
                  className="h-full w-full object-cover scale-150"
                  style={{ objectPosition: item.objectPosition }}
                />
              </div>
              <div className="absolute left-1/2 -translate-x-1/2 -bottom-5 flex h-11 w-11 items-center justify-center rounded-full border border-neutral-200 bg-white shadow-sm">
                <HighlightIcon type={item.icon} />
              </div>
            </div>
            <h3 className="font-semibold text-neutral-900 mb-1.5">{item.title}</h3>
            <p className="text-sm text-neutral-600 leading-relaxed max-w-[220px]">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
