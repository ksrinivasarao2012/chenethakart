"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Package } from "lucide-react";
import { EmptyState, ErrorNotice, Skeleton } from "@/components/ui/States";
import { api, errorMessage } from "@/lib/api";
import { formatINR } from "@/lib/format";
import type { Order } from "@/lib/types";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api<Order[]>("/me/orders").then(setOrders).catch((e) => setError(errorMessage(e)));
  }, []);

  if (error) return <ErrorNotice message={error} />;
  if (!orders) return <Skeleton className="h-60 w-full" />;
  if (orders.length === 0) return <EmptyState icon={<Package className="h-8 w-8" />} title="No orders yet" text="When you place an order it will show up here, with live tracking." actionHref="/shop" actionLabel="Start shopping" />;

  return (
    <div>
      <h2 className="mb-5 text-2xl font-semibold">Order history</h2>
      <ul className="space-y-4">
        {orders.map((o) => (
          <li key={o.number} className="card p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold">{o.number}</p>
                <p className="text-xs text-brown-soft">Placed {o.created_at}</p>
              </div>
              <span className="rounded-full bg-forest-light px-3 py-1 text-xs font-semibold text-forest">{o.status}</span>
            </div>
            <ul className="mt-4 flex gap-2 overflow-x-auto">
              {o.items.map((i) => (
                <li key={i.product_id} className="relative h-16 w-14 shrink-0 overflow-hidden rounded-lg bg-beige" title={i.name}>
                  {i.image && <Image src={i.image} alt={i.name} fill sizes="56px" className="object-cover" />}
                </li>
              ))}
            </ul>
            <div className="mt-4 flex items-center justify-between">
              <p className="font-semibold text-terracotta">{formatINR(o.total)}</p>
              <Link href={`/account/orders/${o.number}`} className="text-sm font-medium text-terracotta underline">View & track</Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
