"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import OrderDetails from "@/components/order/OrderDetails";
import { ErrorNotice, Skeleton } from "@/components/ui/States";
import { api, errorMessage } from "@/lib/api";
import type { Order } from "@/lib/types";

export default function OrderPage() {
  const { number } = useParams<{ number: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = () => api<Order>(`/orders/${number}`).then(setOrder).catch((e) => setError(errorMessage(e)));
    load();
    const t = setInterval(load, 30000); // refresh the simulated tracking
    return () => clearInterval(t);
  }, [number]);

  if (error) return <ErrorNotice message={error} />;
  if (!order) return <Skeleton className="h-80 w-full" />;
  return (
    <div>
      <Link href="/account/orders" className="text-sm text-brown-soft hover:text-terracotta">← All orders</Link>
      <h2 className="mb-6 mt-2 text-2xl font-semibold">Order {order.number} · <span className="text-terracotta">{order.status}</span></h2>
      <OrderDetails order={order} />
    </div>
  );
}
