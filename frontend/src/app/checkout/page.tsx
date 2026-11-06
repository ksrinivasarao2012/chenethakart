"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Banknote, CreditCard, Info, Lock, ShoppingBag, Smartphone, Truck, Zap } from "lucide-react";
import CouponBox from "@/components/cart/CouponBox";
import Totals from "@/components/cart/Totals";
import Button from "@/components/ui/Button";
import Field from "@/components/ui/Field";
import { EmptyState, ErrorNotice, Skeleton } from "@/components/ui/States";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { useQuote } from "@/hooks/useQuote";
import { api, ApiError, errorMessage } from "@/lib/api";
import { INDIAN_STATES } from "@/lib/constants";
import { cn, formatINR } from "@/lib/format";
import type { Order, PaymentMethod, SavedAddress, ShippingMethod } from "@/lib/types";
import { isEmail, isFutureExpiry, isPhone, isPincode, isUpi, luhn, required } from "@/lib/validation";

type Form = {
  name: string; email: string; phone: string;
  line1: string; line2: string; city: string; state: string; pincode: string;
  upi: string; cardNumber: string; cardName: string; cardExpiry: string; cardCvv: string;
};
const EMPTY: Form = { name: "", email: "", phone: "", line1: "", line2: "", city: "", state: "", pincode: "", upi: "", cardNumber: "", cardName: "", cardExpiry: "", cardCvv: "" };

export default function CheckoutPage() {
  const router = useRouter();
  const toast = useToast();
  const { user } = useAuth();
  const { items, ready, coupon, clear } = useCart();
  const [form, setForm] = useState<Form>(EMPTY);
  const [shipping, setShipping] = useState<ShippingMethod>("standard");
  const [payment, setPayment] = useState<PaymentMethod>("upi");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState("");
  const [saved, setSaved] = useState<SavedAddress[]>([]);
  const [saveAddress, setSaveAddress] = useState(false);
  const placed = useRef(false);
  const prefilled = useRef(false);
  const { quote, loading, error } = useQuote(items, shipping, coupon);

  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    if (errors[k]) setErrors((x) => ({ ...x, [k]: "" }));
  };

  useEffect(() => {
    if (!user || prefilled.current) return;
    prefilled.current = true;
    setForm((f) => ({ ...f, name: f.name || user.name, email: f.email || user.email, phone: f.phone || (user.phone ?? "") }));
    api<SavedAddress[]>("/me/addresses")
      .then((list) => {
        setSaved(list);
        const d = list.find((a) => a.is_default) ?? list[0];
        if (d) fillAddress(d);
      })
      .catch(() => undefined);
  }, [user]);

  function fillAddress(a: SavedAddress) {
    setForm((f) => ({ ...f, line1: a.line1, line2: a.line2, city: a.city, state: a.state, pincode: a.pincode, phone: f.phone || a.phone, name: f.name || a.full_name }));
    setErrors({});
  }

  const validate = () => {
    const e: Record<string, string> = {};
    const req = (k: keyof Form, label: string, min = 1) => { const m = required(form[k], label, min); if (m) e[k] = m; };
    req("name", "Full name", 2);
    if (!isEmail(form.email)) e.email = "Enter a valid email address.";
    if (!isPhone(form.phone)) e.phone = "Enter a valid 10-digit mobile number.";
    req("line1", "Address", 3);
    req("city", "City", 2);
    if (!form.state) e.state = "Select your state.";
    if (!isPincode(form.pincode)) e.pincode = "Enter a valid 6-digit PIN code.";
    if (payment === "upi" && !isUpi(form.upi)) e.upi = "Enter a valid UPI ID, like name@bank.";
    if (payment === "card") {
      if (!luhn(form.cardNumber)) e.cardNumber = "Enter a valid card number.";
      req("cardName", "Name on card", 2);
      if (!isFutureExpiry(form.cardExpiry)) e.cardExpiry = "Use a future date as MM/YY.";
      if (!/^\d{3,4}$/.test(form.cardCvv)) e.cardCvv = "Enter the 3 or 4 digit CVV.";
    }
    return e;
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setFormError("");
    const e = validate();
    setErrors(e);
    const first = Object.keys(e)[0];
    if (first) {
      document.getElementById(`co-${first}`)?.focus();
      return;
    }
    setBusy(true);
    try {
      // NOTE: card / UPI details are validated here but deliberately never sent to the server (simulated payment).
      const order = await api<Order>("/orders", {
        method: "POST",
        json: {
          items: items.map((i) => ({ product_id: i.productId, quantity: i.quantity })),
          shipping_method: shipping,
          payment_method: payment,
          coupon: quote?.coupon_valid ? quote.coupon : null,
          name: form.name, email: form.email, phone: form.phone,
          address: { full_name: form.name, phone: form.phone, line1: form.line1, line2: form.line2, city: form.city, state: form.state, pincode: form.pincode },
        },
      });
      if (user && saveAddress) {
        api("/me/addresses", { method: "POST", json: { label: "Home", full_name: form.name, phone: form.phone, line1: form.line1, line2: form.line2, city: form.city, state: form.state, pincode: form.pincode, is_default: saved.length === 0 } }).catch(() => undefined);
      }
      placed.current = true;
      try { sessionStorage.setItem("ck_last_order", JSON.stringify(order)); } catch { /* ignore */ }
      clear();
      router.push(`/order/${order.number}`);
    } catch (err) {
      if (err instanceof ApiError && Object.keys(err.fields).length) {
        const mapped: Record<string, string> = {};
        Object.entries(err.fields).forEach(([k, v]) => (mapped[k.replace("address.", "")] = v));
        setErrors(mapped);
      }
      setFormError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  if (!ready) return <div className="container-page py-12"><Skeleton className="h-96 w-full" /></div>;
  if (items.length === 0 && !placed.current) {
    return <div className="container-page py-10"><EmptyState icon={<ShoppingBag className="h-8 w-8" />} title="Nothing to check out yet" text="Add a few handmade treasures to your cart first." actionHref="/shop" actionLabel="Browse the shop" /></div>;
  }

  const radioCard = (active: boolean) => cn("flex cursor-pointer items-center gap-4 rounded-2xl border-2 bg-white p-4 transition", active ? "border-terracotta shadow-soft" : "border-beige hover:border-beige-dark");
  const sectionTitle = "mb-5 flex items-center gap-3 text-xl font-semibold";
  const num = "flex h-8 w-8 items-center justify-center rounded-full bg-terracotta font-sans text-sm text-white";

  return (
    <div className="container-page py-8 md:py-14">
      <h1 className="text-3xl font-semibold md:text-5xl">Checkout</h1>
      <p className="mt-3 flex items-start gap-2 rounded-xl bg-beige/60 px-4 py-3 text-sm text-brown-soft">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-terracotta" aria-hidden />
        <span><strong className="text-brown">Demo checkout.</strong> Payments are simulated — no money is charged and card or UPI details are never sent anywhere. Use any valid-looking details (test card: 4242 4242 4242 4242).</span>
      </p>

      <form onSubmit={submit} noValidate className="mt-8 grid gap-8 lg:grid-cols-[1fr_420px]">
        <div className="space-y-8">
          <section className="card p-6" aria-labelledby="s1">
            <h2 id="s1" className={sectionTitle}><span className={num}>1</span> Customer information</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name" id="co-name" error={errors.name} className="sm:col-span-2">{(p) => <input {...p} autoComplete="name" value={form.name} onChange={set("name")} />}</Field>
              <Field label="Email" id="co-email" error={errors.email}>{(p) => <input {...p} type="email" autoComplete="email" value={form.email} onChange={set("email")} />}</Field>
              <Field label="Mobile number" id="co-phone" error={errors.phone}>{(p) => <input {...p} type="tel" inputMode="numeric" maxLength={10} autoComplete="tel-national" value={form.phone} onChange={set("phone")} placeholder="10-digit number" />}</Field>
            </div>
            {!user && <p className="mt-4 text-sm text-brown-soft">Have an account? <Link href="/login?next=/checkout" className="font-medium text-terracotta underline">Log in</Link> to use saved addresses.</p>}
          </section>

          <section className="card p-6" aria-labelledby="s2">
            <h2 id="s2" className={sectionTitle}><span className={num}>2</span> Delivery address</h2>
            {saved.length > 0 && (
              <div className="mb-5 flex flex-wrap gap-2" role="group" aria-label="Saved addresses">
                {saved.map((a) => (
                  <button type="button" key={a.id} onClick={() => fillAddress(a)} className="rounded-full border border-beige-dark bg-white px-4 py-2 text-sm hover:border-terracotta">
                    {a.label}: {a.line1.slice(0, 22)}…, {a.pincode}
                  </button>
                ))}
              </div>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Address line 1" id="co-line1" error={errors.line1} className="sm:col-span-2">{(p) => <input {...p} autoComplete="address-line1" value={form.line1} onChange={set("line1")} placeholder="House no., building, street" />}</Field>
              <Field label="Address line 2 (optional)" id="co-line2" error={errors.line2} className="sm:col-span-2">{(p) => <input {...p} autoComplete="address-line2" value={form.line2} onChange={set("line2")} placeholder="Landmark, area" />}</Field>
              <Field label="City" id="co-city" error={errors.city}>{(p) => <input {...p} autoComplete="address-level2" value={form.city} onChange={set("city")} />}</Field>
              <Field label="State" id="co-state" error={errors.state}>
                {(p) => (
                  <select {...p} autoComplete="address-level1" value={form.state} onChange={set("state")}>
                    <option value="">Select state</option>
                    {INDIAN_STATES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                )}
              </Field>
              <Field label="PIN code" id="co-pincode" error={errors.pincode}>{(p) => <input {...p} inputMode="numeric" maxLength={6} autoComplete="postal-code" value={form.pincode} onChange={set("pincode")} />}</Field>
            </div>
            {user && (
              <label className="mt-4 flex items-center gap-2 text-sm"><input type="checkbox" checked={saveAddress} onChange={(e) => setSaveAddress(e.target.checked)} className="h-4 w-4 accent-terracotta" /> Save this address to my account</label>
            )}
          </section>

          <section className="card p-6" aria-labelledby="s3">
            <h2 id="s3" className={sectionTitle}><span className={num}>3</span> Shipping method</h2>
            <div className="space-y-3" role="radiogroup" aria-label="Shipping method">
              {([["standard", Truck, "Standard delivery", "5–7 business days", "Free above ₹999, else ₹60"], ["express", Zap, "Express delivery", "2–3 business days", "₹149"]] as const).map(([id, Icon, label, eta, price]) => (
                <label key={id} className={radioCard(shipping === id)}>
                  <input type="radio" name="shipping" value={id} checked={shipping === id} onChange={() => setShipping(id)} className="h-4 w-4 accent-terracotta" />
                  <Icon className="h-5 w-5 text-forest" aria-hidden />
                  <span className="flex-1"><span className="block font-medium">{label}</span><span className="text-sm text-brown-soft">{eta}</span></span>
                  <span className="text-sm font-semibold">{price}</span>
                </label>
              ))}
            </div>
          </section>

          <section className="card p-6" aria-labelledby="s4">
            <h2 id="s4" className={sectionTitle}><span className={num}>4</span> Payment method <span className="rounded-full bg-sage-light px-2.5 py-0.5 font-sans text-xs font-semibold text-forest">Simulated</span></h2>
            <div className="space-y-3" role="radiogroup" aria-label="Payment method">
              {([["upi", Smartphone, "UPI", "Pay with any UPI app"], ["card", CreditCard, "Credit / debit card", "Visa, Mastercard, RuPay"], ["cod", Banknote, "Cash on delivery", "Pay when your order arrives"]] as const).map(([id, Icon, label, sub]) => (
                <div key={id}>
                  <label className={radioCard(payment === id)}>
                    <input type="radio" name="payment" value={id} checked={payment === id} onChange={() => setPayment(id)} className="h-4 w-4 accent-terracotta" />
                    <Icon className="h-5 w-5 text-forest" aria-hidden />
                    <span className="flex-1"><span className="block font-medium">{label}</span><span className="text-sm text-brown-soft">{sub}</span></span>
                  </label>
                  {payment === id && id === "upi" && (
                    <div className="mt-3 px-1"><Field label="UPI ID" id="co-upi" error={errors.upi}>{(p) => <input {...p} value={form.upi} onChange={set("upi")} placeholder="yourname@upi" autoComplete="off" />}</Field></div>
                  )}
                  {payment === id && id === "card" && (
                    <div className="mt-3 grid gap-4 px-1 sm:grid-cols-2">
                      <Field label="Card number" id="co-cardNumber" error={errors.cardNumber} className="sm:col-span-2">{(p) => <input {...p} inputMode="numeric" autoComplete="off" maxLength={23} value={form.cardNumber} onChange={(e) => setForm((f) => ({ ...f, cardNumber: e.target.value.replace(/[^\d ]/g, "").replace(/\s+/g, " ") }))} placeholder="4242 4242 4242 4242" />}</Field>
                      <Field label="Name on card" id="co-cardName" error={errors.cardName} className="sm:col-span-2">{(p) => <input {...p} autoComplete="off" value={form.cardName} onChange={set("cardName")} />}</Field>
                      <Field label="Expiry (MM/YY)" id="co-cardExpiry" error={errors.cardExpiry}>{(p) => <input {...p} inputMode="numeric" autoComplete="off" maxLength={5} value={form.cardExpiry} onChange={(e) => { let v = e.target.value.replace(/[^\d]/g, "").slice(0, 4); if (v.length > 2) v = `${v.slice(0, 2)}/${v.slice(2)}`; setForm((f) => ({ ...f, cardExpiry: v })); }} placeholder="MM/YY" />}</Field>
                      <Field label="CVV" id="co-cardCvv" error={errors.cardCvv}>{(p) => <input {...p} type="password" inputMode="numeric" maxLength={4} autoComplete="off" value={form.cardCvv} onChange={set("cardCvv")} />}</Field>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="h-fit lg:sticky lg:top-28" aria-label="Order summary">
          <div className="card p-6">
            <h2 className="text-2xl font-semibold">Order summary</h2>
            <ul className="mt-5 divide-y divide-beige">
              {items.map((i) => (
                <li key={i.productId} className="flex items-center gap-3 py-3 first:pt-0">
                  <span className="relative h-16 w-14 shrink-0 overflow-hidden rounded-lg bg-beige">
                    {i.image && <Image src={i.image} alt="" fill sizes="56px" className="object-cover" />}
                    <span className="absolute -right-0 -top-0 flex h-5 min-w-5 items-center justify-center rounded-bl-lg bg-terracotta px-1 text-[11px] font-semibold text-white">{i.quantity}</span>
                  </span>
                  <span className="flex-1 text-sm font-medium">{i.name}</span>
                  <span className="text-sm font-semibold">{formatINR(i.price * i.quantity)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4"><CouponBox quote={quote} /></div>
            <div className="mt-6">{error ? <ErrorNotice message={error} /> : quote ? <Totals quote={quote} loading={loading} /> : <Skeleton className="h-32 w-full" />}</div>
            {formError && <p role="alert" className="mt-4 rounded-xl bg-terracotta-light px-4 py-3 text-sm text-terracotta-dark">{formError}</p>}
            <Button type="submit" size="lg" className="mt-6 w-full" loading={busy} disabled={!quote}>
              <Lock className="h-4 w-4" aria-hidden /> Place Order{quote ? ` · ${formatINR(quote.total)}` : ""}
            </Button>
            <p className="mt-3 text-center text-xs text-brown-soft">By placing your order you agree to our <Link href="/support#returns" className="underline">returns policy</Link>.</p>
          </div>
        </aside>
      </form>
    </div>
  );
}
