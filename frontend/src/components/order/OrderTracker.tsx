import { Check } from "lucide-react";
import { cn } from "@/lib/format";
import type { Order } from "@/lib/types";

export default function OrderTracker({ order }: { order: Order }) {
  return (
    <div>
      <ol className="relative space-y-5">
        <div className="absolute bottom-3 left-[13px] top-3 w-0.5 bg-beige-dark" aria-hidden />
        {order.stages.map((s, i) => {
          const done = i < order.stage;
          const current = i === order.stage;
          return (
            <li key={s} className="relative flex items-center gap-4" aria-current={current ? "step" : undefined}>
              <span className={cn("relative z-10 flex h-7 w-7 items-center justify-center rounded-full border-2 text-xs", done || (current && i === order.stages.length - 1) ? "border-forest bg-forest text-white" : current ? "border-terracotta bg-terracotta text-white" : "border-beige-dark bg-ivory text-brown-soft")}>
                {done || (current && i === order.stages.length - 1) ? <Check className="h-4 w-4" aria-hidden /> : i + 1}
              </span>
              <span className={cn("text-sm", current ? "font-semibold text-brown" : done ? "text-brown" : "text-brown-soft")}>
                {s}
                {current && i < order.stages.length - 1 && <span className="ml-2 rounded-full bg-terracotta-light px-2 py-0.5 text-[11px] font-semibold text-terracotta-dark">In progress</span>}
              </span>
            </li>
          );
        })}
      </ol>
      {order.tracking_is_simulated && (
        <p className="mt-5 rounded-xl bg-beige/60 px-4 py-2.5 text-xs text-brown-soft">
          Demo tracking: status advances automatically every couple of minutes so the flow can be shown. Real courier tracking isn’t connected.
        </p>
      )}
    </div>
  );
}
