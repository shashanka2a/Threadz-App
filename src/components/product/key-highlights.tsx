"use client";

import { useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  const className = "h-4 w-4 text-neutral-900";

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
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    const container = scrollRef.current;
    if (!container) return;
    const amount = container.clientWidth * 0.85;
    container.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (
    <div className="mb-6">
      <h3 className="text-sm mb-1">Key Highlights</h3>
      <p className="text-xs text-neutral-600 mb-3">
        Every detail, crafted for everyday comfort.
      </p>

      <div className="relative px-9">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => scroll("left")}
          className="absolute left-0 top-[72px] z-10 h-8 w-8 rounded-full border-neutral-300 bg-white shadow-sm"
          aria-label="Scroll highlights left"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {HIGHLIGHTS.map((item) => (
            <div
              key={item.title}
              className="flex w-[calc(50%-6px)] min-w-[calc(50%-6px)] shrink-0 snap-start flex-col items-center text-center"
            >
              <div className="relative mb-6 w-full">
                <div className="aspect-square overflow-hidden rounded-xl bg-neutral-100">
                  <Image
                    src={imageSrc}
                    alt={item.title}
                    width={320}
                    height={320}
                    sizes="180px"
                    className="h-full w-full scale-150 object-cover"
                    style={{ objectPosition: item.objectPosition }}
                  />
                </div>
                <div className="absolute -bottom-4 left-1/2 flex h-9 w-9 -translate-x-1/2 items-center justify-center rounded-full border border-neutral-200 bg-white shadow-sm">
                  <HighlightIcon type={item.icon} />
                </div>
              </div>
              <h4 className="mb-1 text-xs font-semibold text-neutral-900">{item.title}</h4>
              <p className="text-[11px] leading-relaxed text-neutral-600">{item.description}</p>
            </div>
          ))}
        </div>

        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => scroll("right")}
          className="absolute right-0 top-[72px] z-10 h-8 w-8 rounded-full border-neutral-300 bg-white shadow-sm"
          aria-label="Scroll highlights right"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
