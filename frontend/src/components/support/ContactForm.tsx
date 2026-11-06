"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import Button from "@/components/ui/Button";
import Field from "@/components/ui/Field";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { api, ApiError, errorMessage } from "@/lib/api";
import { isEmail } from "@/lib/validation";

export default function ContactForm() {
  const { user } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState("");

  const val = (k: keyof typeof form) => form[k] || (k === "name" ? user?.name ?? "" : k === "email" ? user?.email ?? "" : "");
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = { name: val("name"), email: val("email"), subject: form.subject, message: form.message };
    const v: Record<string, string> = {};
    if (data.name.trim().length < 2) v.name = "Please enter your name.";
    if (!isEmail(data.email)) v.email = "Enter a valid email address.";
    if (data.subject.trim().length < 3) v.subject = "Add a short subject.";
    if (data.message.trim().length < 10) v.message = "Tell us a bit more (at least 10 characters).";
    setErrors(v);
    if (Object.keys(v).length) return;
    setBusy(true);
    try {
      const r = await api<{ message: string }>("/contact", { method: "POST", json: data });
      setDone(r.message);
      setForm({ name: "", email: "", subject: "", message: "" });
      toast(r.message);
    } catch (err) {
      if (err instanceof ApiError && err.status === 422) setErrors(err.fields);
      toast(errorMessage(err), "error");
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <div role="status" className="card flex flex-col items-center p-10 text-center">
        <CheckCircle2 className="h-12 w-12 text-forest" aria-hidden />
        <h2 className="mt-4 text-2xl font-semibold">Message sent</h2>
        <p className="mt-2 text-brown-soft">{done}</p>
        <Button variant="outline" className="mt-6" onClick={() => setDone("")}>Send another message</Button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="card grid gap-4 p-6 sm:grid-cols-2">
      <h2 className="font-serif text-2xl font-semibold sm:col-span-2">Send us a message</h2>
      <Field label="Your name" id="ct-name" error={errors.name}>{(p) => <input {...p} value={val("name")} onChange={set("name")} autoComplete="name" />}</Field>
      <Field label="Email" id="ct-email" error={errors.email}>{(p) => <input {...p} type="email" value={val("email")} onChange={set("email")} autoComplete="email" />}</Field>
      <Field label="Subject" id="ct-subject" error={errors.subject} className="sm:col-span-2">{(p) => <input {...p} value={form.subject} onChange={set("subject")} />}</Field>
      <Field label="Message" id="ct-message" error={errors.message} className="sm:col-span-2">{(p) => <textarea {...p} rows={5} value={form.message} onChange={set("message")} maxLength={2000} />}</Field>
      <div className="sm:col-span-2"><Button type="submit" size="lg" loading={busy}>Send message</Button></div>
    </form>
  );
}
