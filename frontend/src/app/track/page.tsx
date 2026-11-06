"use client";

import { useState } from "react";
import { PackageSearch } from "lucide-react";
import OrderDetails from "@/components/order/OrderDetails";
import Button from "@/components/ui/Button";
import Field from "@/components/ui/Field";
import { api, errorMessage } from "@/lib/api";
import type { Order } from "@/lib/types";
import { isEmail } from "@/lib/validation";

export default function TrackPage() {
  const [number, setNumber] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [order, setOrder] = useState<Order | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (number.trim().length < 6) next.number = "Enter your order number, like CK-2611-ABC12.";
    if (!isEmail(email)) next.email = "Enter the email used at checkout.";
    setErrors(next);
    setError("");
    if (Object.keys(next).length) return;
    setBusy(true);
    try {
      setOrder(await api<Order>("/orders/track", { method: "POST", json: { number, email } }));
    } catch (err) {
      setOrder(null);
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container-page py-8 md:py-14">
      <div className="mx-auto max-w-xl text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-beige text-terracotta"><PackageSearch className="h-7 w-7" aria-hidden /></span>
        <h1 className="mt-4 text-3xl font-semibold md:text-5xl">Track your order</h1>
        <p className="mt-3 text-brown-soft">Enter your order number and the email you used at checkout.</p>
      </div>
      <form onSubmit={submit} noValidate className="card mx-auto mt-8 grid max-w-xl gap-4 p-6">
        <Field label="Order number" id="trk-number" error={errors.number}>{(p) => <input {...p} value={number} onChange={(e) => setNumber(e.target.value)} placeholder="CK-2611-ABC12" autoComplete="off" />}</Field>
        <Field label="Email" id="trk-email" error={errors.email}>{(p) => <input {...p} type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />}</Field>
        {error && <p role="alert" className="rounded-xl bg-terracotta-light px-4 py-3 text-sm text-terracotta-dark">{error}</p>}
        <Button type="submit" loading={busy} size="lg">Track order</Button>
      </form>
      {order && (
        <div className="mt-12">
          <h2 className="mb-6 text-2xl font-semibold">Order {order.number} · <span className="text-terracotta">{order.status}</span></h2>
          <OrderDetails order={order} />
        </div>
      )}
    </div>
  );
}
