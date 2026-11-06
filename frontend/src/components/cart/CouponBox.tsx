"use client";

import { useState } from "react";
import { CheckCircle2, Tag, X } from "lucide-react";
import { useCart } from "@/context/CartContext";
import type { Quote } from "@/lib/types";
import Button from "../ui/Button";

export default function CouponBox({ quote }: { quote: Quote | null }) {
  const { coupon, setCoupon } = useCart();
  const [draft, setDraft] = useState("");
  const [touched, setTouched] = useState(false);
  const applied = quote?.coupon_valid ? quote.coupon : null;

  // Not a <form>: this component also renders inside the checkout form, and forms can't nest.
  const apply = () => {
    if (!draft.trim()) return;
    setCoupon(draft.trim().toUpperCase());
    setTouched(true);
  };

  if (applied) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-xl bg-forest-light px-4 py-3 text-sm">
        <span className="flex items-center gap-2 font-medium text-forest"><CheckCircle2 className="h-4 w-4" aria-hidden /> {quote?.coupon_message}</span>
        <button onClick={() => { setCoupon(""); setDraft(""); setTouched(false); }} aria-label="Remove coupon" className="rounded-full p-1 text-forest hover:bg-white/70"><X className="h-4 w-4" /></button>
      </div>
    );
  }

  const invalidMsg = touched && coupon && quote && !quote.coupon_valid ? quote.coupon_message : null;
  return (
    <div>
      <div className="flex gap-2">
        <label htmlFor="coupon" className="sr-only">Coupon code</label>
        <div className="relative flex-1">
          <Tag className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-brown-soft" aria-hidden />
          <input id="coupon" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Coupon code" className="input !pl-10 uppercase placeholder:normal-case" aria-describedby="coupon-msg" onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); apply(); } }} />
        </div>
        <Button type="button" variant="soft" onClick={apply}>Apply</Button>
      </div>
      <p id="coupon-msg" role={invalidMsg ? "alert" : undefined} className={`mt-2 text-xs ${invalidMsg ? "text-terracotta" : "text-brown-soft"}`}>
        {invalidMsg ?? "Try HANDMADE10, WELCOME100 or FREESHIP."}
      </p>
    </div>
  );
}
