import { formatINR } from "@/lib/format";
import type { Quote } from "@/lib/types";

export default function Totals({ quote, loading }: { quote: Quote; loading?: boolean }) {
  const row = "flex items-center justify-between text-sm";
  return (
    <dl className={`space-y-3 ${loading ? "opacity-60 transition" : ""}`} aria-busy={loading}>
      <div className={row}><dt className="text-brown-soft">Subtotal</dt><dd className="font-medium">{formatINR(quote.subtotal)}</dd></div>
      {quote.discount > 0 && (
        <div className={row}><dt className="text-forest">Discount{quote.coupon ? ` (${quote.coupon})` : ""}</dt><dd className="font-medium text-forest">− {formatINR(quote.discount)}</dd></div>
      )}
      <div className={row}><dt className="text-brown-soft">Shipping</dt><dd className="font-medium">{quote.shipping === 0 ? "Free" : formatINR(quote.shipping)}</dd></div>
      <div className="flex items-center justify-between border-t border-beige pt-4"><dt className="text-base font-semibold">Total payable</dt><dd className="text-2xl font-semibold text-terracotta">{formatINR(quote.total)}</dd></div>
    </dl>
  );
}
