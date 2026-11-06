"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import AuthShell from "@/components/auth/AuthShell";
import Button from "@/components/ui/Button";
import Field from "@/components/ui/Field";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { ApiError, errorMessage } from "@/lib/api";
import { isEmail } from "@/lib/validation";

function SignupForm() {
  const router = useRouter();
  const raw = useSearchParams().get("next");
  const next = raw && raw.startsWith("/") && !raw.startsWith("//") ? raw : "/account";
  const { user, loading, signup } = useAuth();
  const toast = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace(next);
  }, [user, loading, next, router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v: Record<string, string> = {};
    if (name.trim().length < 2) v.name = "Enter your full name.";
    if (!isEmail(email)) v.email = "Enter a valid email address.";
    if (password.length < 8) v.password = "Use at least 8 characters.";
    if (confirm !== password) v.confirm = "Passwords don't match.";
    setErrors(v);
    setFormError("");
    if (Object.keys(v).length) return;
    setBusy(true);
    try {
      const u = await signup(name, email, password);
      toast(`Welcome to Chenethakart, ${u.name.split(" ")[0]}!`);
      router.replace(next);
    } catch (err) {
      if (err instanceof ApiError && err.status === 422) setErrors(err.fields);
      setFormError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell title="Create your account" subtitle="Save your addresses, track orders and keep your wishlist across devices." footer={<>Already have an account? <Link href={`/login${next !== "/account" ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-medium text-terracotta underline">Log in</Link></>}>
      <form onSubmit={submit} noValidate className="space-y-4">
        <Field label="Full name" id="su-name" error={errors.name}>{(p) => <input {...p} autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />}</Field>
        <Field label="Email" id="su-email" error={errors.email}>{(p) => <input {...p} type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />}</Field>
        <Field label="Password" id="su-password" error={errors.password} hint="At least 8 characters.">{(p) => <input {...p} type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />}</Field>
        <Field label="Confirm password" id="su-confirm" error={errors.confirm}>{(p) => <input {...p} type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />}</Field>
        {formError && !Object.keys(errors).length && <p role="alert" className="rounded-xl bg-terracotta-light px-4 py-3 text-sm text-terracotta-dark">{formError}</p>}
        <Button type="submit" size="lg" className="w-full" loading={busy}>Create account</Button>
      </form>
    </AuthShell>
  );
}

export default function SignupPage() {
  return <Suspense><SignupForm /></Suspense>;
}
