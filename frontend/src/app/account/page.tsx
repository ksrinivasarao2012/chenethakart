"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import Field from "@/components/ui/Field";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { api, ApiError, errorMessage } from "@/lib/api";
import { formatINR } from "@/lib/format";
import type { Order, User } from "@/lib/types";
import { isPhone } from "@/lib/validation";

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const toast = useToast();
  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [orders, setOrders] = useState<Order[] | null>(null);

  useEffect(() => {
    api<Order[]>("/me/orders").then(setOrders).catch(() => setOrders([]));
  }, []);

  if (!user) return null;

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const v: Record<string, string> = {};
    if (name.trim().length < 2) v.name = "Enter your name.";
    if (phone && !isPhone(phone)) v.phone = "Enter a valid 10-digit mobile number.";
    setErrors(v);
    if (Object.keys(v).length) return;
    setBusy(true);
    try {
      setUser(await api<User>("/auth/me", { method: "PATCH", json: { name, phone: phone || null } }));
      toast("Profile updated.");
    } catch (err) {
      if (err instanceof ApiError && err.status === 422) setErrors(err.fields);
      toast(errorMessage(err), "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="card p-6" aria-labelledby="prof">
        <h2 id="prof" className="text-2xl font-semibold">Profile</h2>
        <p className="mt-1 text-sm text-brown-soft">Member since {user.joined}</p>
        <form onSubmit={save} noValidate className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field label="Full name" id="pf-name" error={errors.name}>{(p) => <input {...p} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />}</Field>
          <Field label="Mobile number" id="pf-phone" error={errors.phone}>{(p) => <input {...p} inputMode="numeric" maxLength={10} value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel-national" placeholder="Optional" />}</Field>
          <Field label="Email" id="pf-email" hint="Your email is your login and can't be changed here.">{(p) => <input {...p} value={user.email} readOnly className={`${p.className} bg-beige/50`} />}</Field>
          <div className="flex items-end"><Button type="submit" loading={busy}>Save changes</Button></div>
        </form>
      </section>

      <section className="card p-6" aria-labelledby="recent">
        <div className="flex items-center justify-between">
          <h2 id="recent" className="text-2xl font-semibold">Recent orders</h2>
          <Link href="/account/orders" className="text-sm font-medium text-terracotta underline">View all</Link>
        </div>
        {orders === null ? <p className="mt-4 text-sm text-brown-soft">Loading…</p>
        : orders.length === 0 ? <p className="mt-4 text-sm text-brown-soft">No orders yet. <Link href="/shop" className="font-medium text-terracotta underline">Start shopping</Link></p>
        : (
          <ul className="mt-4 divide-y divide-beige">
            {orders.slice(0, 3).map((o) => (
              <li key={o.number} className="flex items-center justify-between gap-3 py-3 text-sm">
                <div><Link href={`/account/orders/${o.number}`} className="font-medium hover:text-terracotta">{o.number}</Link><p className="text-xs text-brown-soft">{o.created_at}</p></div>
                <span className="rounded-full bg-beige px-3 py-1 text-xs font-medium">{o.status}</span>
                <span className="font-semibold">{formatINR(o.total)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
