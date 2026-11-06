import Image from "next/image";
import Link from "next/link";
import { formatINR } from "@/lib/format";
import type { Order } from "@/lib/types";
import Totals from "../cart/Totals";
import OrderTracker from "./OrderTracker";

export default function OrderDetails({ order }: { order: Order }) {
  const a = order.address;
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <div className="space-y-6">
        <section className="card p-6" aria-labelledby="trk">
          <h2 id="trk" className="mb-5 text-xl font-semibold">Order tracking</h2>
          <OrderTracker order={order} />
        </section>
        <section className="card p-6" aria-labelledby="itm">
          <h2 id="itm" className="mb-4 text-xl font-semibold">Items</h2>
          <ul className="divide-y divide-beige">
            {order.items.map((i) => (
              <li key={i.product_id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                <Link href={`/product/${i.slug}`} className="relative h-16 w-14 shrink-0 overflow-hidden rounded-lg bg-beige">
                  {i.image && <Image src={i.image} alt={i.name} fill sizes="56px" className="object-cover" />}
                </Link>
                <div className="min-w-0 flex-1">
                  <Link href={`/product/${i.slug}`} className="text-sm font-medium hover:text-terracotta">{i.name}</Link>
                  <p className="text-xs text-brown-soft">Qty {i.quantity} × {formatINR(i.price)}</p>
                </div>
                <p className="text-sm font-semibold">{formatINR(i.price * i.quantity)}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>
      <aside className="space-y-6">
        <section className="card p-6" aria-labelledby="pay">
          <h2 id="pay" className="mb-4 text-xl font-semibold">Payment summary</h2>
          <Totals quote={{ ...order, coupon_message: null, coupon_valid: !!order.coupon, free_shipping_gap: 0 }} />
          <p className="mt-4 text-xs text-brown-soft">{order.payment_status} · {order.payment_method.toUpperCase()}</p>
        </section>
        <section className="card p-6" aria-labelledby="addr">
          <h2 id="addr" className="mb-3 text-xl font-semibold">Delivering to</h2>
          <address className="text-sm not-italic leading-relaxed text-brown-soft">
            <strong className="text-brown">{a.full_name}</strong><br />
            {a.line1}{a.line2 ? `, ${a.line2}` : ""}<br />
            {a.city}, {a.state} {a.pincode}<br />
            Phone: {a.phone}
          </address>
          <p className="mt-3 text-xs text-brown-soft">{order.shipping_method === "express" ? "Express delivery (2–3 business days)" : "Standard delivery (5–7 business days)"}</p>
        </section>
      </aside>
    </div>
  );
}
