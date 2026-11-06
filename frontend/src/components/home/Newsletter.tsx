"use client";

import { useState } from "react";
import { Mail } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { api, errorMessage } from "@/lib/api";
import { isEmail } from "@/lib/validation";
import Button from "../ui/Button";

export default function Newsletter() {
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEmail(email)) return setError("Please enter a valid email address.");
    setError("");
    setBusy(true);
    try {
      const r = await api<{ message: string }>("/newsletter", { method: "POST", json: { email } });
      setDone(r.message);
      setEmail("");
      toast(r.message);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-3xl bg-terracotta px-6 py-12 text-center text-white sm:px-12 md:py-16">
      <Mail className="mx-auto h-8 w-8 text-white/80" aria-hidden />
      <h2 className="mt-3 text-3xl font-semibold !text-white md:text-4xl">Join the Chenethakart family</h2>
      <p className="mx-auto mt-3 max-w-lg text-white/85">New arrivals, artisan stories and subscriber-only offers, once or twice a month. No spam.</p>
      {done ? (
        <p role="status" className="mx-auto mt-6 max-w-md rounded-2xl bg-white/15 px-5 py-3 font-medium">{done}</p>
      ) : (
        <form onSubmit={submit} noValidate className="mx-auto mt-6 flex max-w-md flex-col gap-3 sm:flex-row">
          <div className="flex-1 text-left">
            <label htmlFor="nl-email" className="sr-only">Email address</label>
            <input
              id="nl-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              aria-invalid={!!error}
              aria-describedby={error ? "nl-error" : undefined}
              className="w-full rounded-full border-0 bg-white px-5 py-3.5 text-sm text-brown placeholder:text-brown-soft/60 focus:outline-none focus:ring-2 focus:ring-white/60"
            />
            {error && <p id="nl-error" role="alert" className="mt-2 pl-2 text-xs text-white">{error}</p>}
          </div>
          <Button type="submit" variant="forest" size="lg" loading={busy}>Subscribe</Button>
        </form>
      )}
    </div>
  );
}
