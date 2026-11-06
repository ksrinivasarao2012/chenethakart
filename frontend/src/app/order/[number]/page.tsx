"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import OrderDetails from "@/components/order/OrderDetails";
import Button from "@/components/ui/Button";
import { EmptyState, Skeleton } from "@/components/ui/States";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import type { Order } from "@/lib/types";

export default function OrderConfirmationPage() {
  const { number } = useParams<{ number: string }>();
  const { user, loading: authLoading } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "missing">("loading");

  useEffect(() => {
    if (authLoading) return;
    let cached: Order | null = null;
    try {
      const raw = sessionStorage.getItem("ck_last_order");
      if (raw) cached = JSON.parse(raw) as Order;
    } catch { /* ignore */ }
    const fresh = cached && cached.number === number ? cached : null;
    if (fresh) setOrder(fresh);
    if (user) {
      api<Order>(`/orders/${number}`).then((o) => { setOrder(o); setState("ready"); }).catch(() => setState(fresh ? "ready" : "missing"));
    } else {
      setState(fresh ? "ready" : "missing");
    }
  }, [number, user, authLoading]);

  if (state === "loading") return <div className="container-page py-12"><Skeleton className="h-96 w-full" /></div>;
  if (state === "missing" || !order) {
    return (
      <div className="container-page py-10">
        <EmptyState title="We couldn't find that order" text="If you checked out as a guest, look it up with your order number and email." actionHref="/track" actionLabel="Track an order" />
      </div>
    );
  }

  return (
    <div className="container-page py-8 md:py-14">
      <div className="mx-auto mb-10 max-w-2xl text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-forest-light text-forest"><CheckCircle2 className="h-9 w-9" aria-hidden /></span>
        <h1 className="mt-4 text-3xl font-semibold md:text-5xl">Thank you, {order.name.split(" ")[0]}!</h1>
        <p className="mt-3 text-lg text-brown-soft">Your order <strong className="text-brown">{order.number}</strong> has been placed. A confirmation would be sent to {order.email}.</p>
        <p className="mt-3 text-xs text-brown-soft">Demo store: this order is saved in the demo database, but no real payment was taken and nothing will be shipped.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button href="/shop">Continue Shopping</Button>
          {user ? <Button href="/account/orders" variant="outline">View my orders</Button> : <Button href="/track" variant="outline">Track this order</Button>}
        </div>
        {!user && <p className="mt-4 text-sm text-brown-soft"><Link href="/signup" className="font-medium text-terracotta underline">Create an account</Link> to keep your order history.</p>}
      </div>
      <OrderDetails order={order} />
    </div>
  );
}
