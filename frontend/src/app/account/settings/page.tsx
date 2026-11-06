"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Field from "@/components/ui/Field";
import { useToast } from "@/context/ToastContext";
import { api, ApiError, errorMessage } from "@/lib/api";

export default function SettingsPage() {
  const toast = useToast();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v: Record<string, string> = {};
    if (!current) v.current = "Enter your current password.";
    if (next.length < 8) v.next = "Use at least 8 characters.";
    if (confirm !== next) v.confirm = "Passwords don't match.";
    setErrors(v);
    if (Object.keys(v).length) return;
    setBusy(true);
    try {
      await api("/auth/change-password", { method: "POST", json: { current_password: current, new_password: next } });
      toast("Password updated.");
      setCurrent(""); setNext(""); setConfirm("");
    } catch (err) {
      if (err instanceof ApiError && err.status === 400) setErrors({ current: err.message });
      else toast(errorMessage(err), "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="card max-w-xl p-6" aria-labelledby="pw">
      <h2 id="pw" className="text-2xl font-semibold">Account settings</h2>
      <h3 className="mt-6 font-sans text-base font-semibold text-brown">Change password</h3>
      <form onSubmit={submit} noValidate className="mt-4 space-y-4">
        <Field label="Current password" id="st-cur" error={errors.current}>{(p) => <input {...p} type="password" autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} />}</Field>
        <Field label="New password" id="st-new" error={errors.next} hint="At least 8 characters.">{(p) => <input {...p} type="password" autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} />}</Field>
        <Field label="Confirm new password" id="st-conf" error={errors.confirm}>{(p) => <input {...p} type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />}</Field>
        <Button type="submit" loading={busy}>Update password</Button>
      </form>
    </section>
  );
}
