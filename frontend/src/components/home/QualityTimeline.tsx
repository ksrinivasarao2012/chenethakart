import { Gift, HandHeart, RotateCcw, Ruler, Search, Send, Truck } from "lucide-react";
import { QA_STEPS } from "@/lib/constants";
import { cn } from "@/lib/format";

const ICONS = [HandHeart, Send, Search, Ruler, RotateCcw, Gift, Truck];

/** Visual QA pipeline. `compact` is the horizontal strip used on the homepage; `full` is the detailed vertical flow. */
export default function QualityTimeline({ variant = "compact" }: { variant?: "compact" | "full" }) {
  if (variant === "compact") {
    return (
      <ol className="relative grid gap-6 sm:grid-cols-2 lg:grid-cols-7 lg:gap-3">
        <div className="absolute left-0 right-0 top-7 -z-0 hidden h-px bg-ivory/30 lg:block" aria-hidden />
        {QA_STEPS.map((s, i) => {
          const Icon = ICONS[i];
          return (
            <li key={s.title} className="relative flex items-start gap-4 lg:flex-col lg:items-center lg:text-center">
              <span
                className={cn(
                  "relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2",
                  s.loop ? "border-dashed border-terracotta bg-terracotta-light text-terracotta" : "border-sage bg-forest text-sage",
                )}
              >
                <Icon className="h-6 w-6" aria-hidden />
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-ivory text-[11px] font-bold text-forest">{i + 1}</span>
              </span>
              <div>
                <h3 className="font-sans text-sm font-semibold text-white">{s.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-ivory/75 lg:px-1">{s.text}</p>
              </div>
            </li>
          );
        })}
      </ol>
    );
  }

  return (
    <ol className="relative mx-auto max-w-3xl">
      <div className="absolute bottom-6 left-7 top-6 w-0.5 bg-sage/60" aria-hidden />
      {QA_STEPS.map((s, i) => {
        const Icon = ICONS[i];
        return (
          <li key={s.title} className="relative flex gap-5 pb-8 last:pb-0">
            <span
              className={cn(
                "relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 bg-ivory",
                s.loop ? "border-dashed border-terracotta text-terracotta" : "border-forest text-forest",
              )}
            >
              <Icon className="h-6 w-6" aria-hidden />
            </span>
            <div className={cn("card flex-1 p-5", s.loop && "border-dashed border-terracotta/50 bg-terracotta-light/40")}>
              <p className="eyebrow">Step {i + 1}{s.loop ? " · only if needed" : ""}</p>
              <h3 className="mt-1 text-xl font-semibold">{s.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-brown-soft">{s.text}</p>
              {i === 3 && (
                <ul className="mt-3 flex flex-wrap gap-2 text-xs">
                  {["Stitching", "Finishing", "Material quality", "Dimensions"].map((c) => (
                    <li key={c} className="rounded-full bg-sage-light px-3 py-1 font-medium text-forest">✓ {c}</li>
                  ))}
                </ul>
              )}
              {s.loop && <p className="mt-3 text-xs font-medium text-terracotta-dark">↺ Returns to step 3 for re-inspection before it can move on.</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
