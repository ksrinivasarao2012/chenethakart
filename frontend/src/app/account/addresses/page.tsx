"use client";

import { useEffect, useState } from "react";
import { MapPin, Plus, Trash2 } from "lucide-react";
import Button from "@/components/ui/Button";
import Field from "@/components/ui/Field";
import { EmptyState, ErrorNotice, Skeleton } from "@/components/ui/States";
import { useToast } from "@/context/ToastContext";
import { api, ApiError, errorMessage } from "@/lib/api";
import { INDIAN_STATES } from "@/lib/constants";
import type { SavedAddress } from "@/lib/types";
import { isPhone, isPincode, required } from "@/lib/validation";

type Draft = Omit<SavedAddress, "id">;
const BLANK: Draft = { label: "Home", full_name: "", phone: "", line1: "", line2: "", city: "", state: "", pincode: "", is_default: false };

export default function AddressesPage() {
  const toast = useToast();
  const [list, setList] = useState<SavedAddress[] | null>(null);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<number | "new" | null>(null);
  const [draft, setDraft] = useState<Draft>(BLANK);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  const load = () => api<SavedAddress[]>("/me/addresses").then(setList).catch((e) => setError(errorMessage(e)));
  useEffect(() => { load(); }, []);

  const open = (a?: SavedAddress) => {
    setErrors({});
    if (a) { const { id, ...rest } = a; setDraft(rest); setEditing(id); } else { setDraft(BLANK); setEditing("new"); }
  };
  const set = (k: keyof Draft) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setDraft((d) => ({ ...d, [k]: e.target.value }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const v: Record<string, string> = {};
    const r = (k: keyof Draft, label: string, min = 1) => { const m = required(String(draft[k]), label, min); if (m) v[k] = m; };
    r("full_name", "Full name", 2); r("line1", "Address", 3); r("city", "City", 2);
    if (!isPhone(draft.phone)) v.phone = "Enter a valid 10-digit mobile number.";
    if (!draft.state) v.state = "Select a state.";
    if (!isPincode(draft.pincode)) v.pincode = "Enter a valid 6-digit PIN code.";
    setErrors(v);
    if (Object.keys(v).length) return;
    setBusy(true);
    try {
      if (editing === "new") await api("/me/addresses", { method: "POST", json: draft });
      else await api(`/me/addresses/${editing}`, { method: "PUT", json: draft });
      toast("Address saved.");
      setEditing(null);
      await load();
    } catch (err) {
      if (err instanceof ApiError && err.status === 422) setErrors(err.fields);
      toast(errorMessage(err), "error");
    } finally {
      setBusy(false);
    }
  };

  const del = async (a: SavedAddress) => {
    try { await api(`/me/addresses/${a.id}`, { method: "DELETE" }); toast("Address removed.", "info"); await load(); }
    catch (e) { toast(errorMessage(e), "error"); }
  };

  if (error) return <ErrorNotice message={error} />;
  if (!list) return <Skeleton className="h-60 w-full" />;

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Saved addresses</h2>
        {editing === null && <Button size="sm" onClick={() => open()}><Plus className="h-4 w-4" aria-hidden /> Add address</Button>}
      </div>

      {editing !== null && (
        <form onSubmit={save} noValidate className="card mb-6 grid gap-4 p-6 sm:grid-cols-2">
          <h3 className="font-serif text-xl sm:col-span-2">{editing === "new" ? "New address" : "Edit address"}</h3>
          <Field label="Label" id="ad-label">{(p) => <select {...p} value={draft.label} onChange={set("label")}><option>Home</option><option>Work</option><option>Other</option></select>}</Field>
          <Field label="Full name" id="ad-name" error={errors.full_name}>{(p) => <input {...p} value={draft.full_name} onChange={set("full_name")} />}</Field>
          <Field label="Mobile number" id="ad-phone" error={errors.phone}>{(p) => <input {...p} inputMode="numeric" maxLength={10} value={draft.phone} onChange={set("phone")} />}</Field>
          <Field label="PIN code" id="ad-pin" error={errors.pincode}>{(p) => <input {...p} inputMode="numeric" maxLength={6} value={draft.pincode} onChange={set("pincode")} />}</Field>
          <Field label="Address line 1" id="ad-l1" error={errors.line1} className="sm:col-span-2">{(p) => <input {...p} value={draft.line1} onChange={set("line1")} />}</Field>
          <Field label="Address line 2 (optional)" id="ad-l2" className="sm:col-span-2">{(p) => <input {...p} value={draft.line2} onChange={set("line2")} />}</Field>
          <Field label="City" id="ad-city" error={errors.city}>{(p) => <input {...p} value={draft.city} onChange={set("city")} />}</Field>
          <Field label="State" id="ad-state" error={errors.state}>{(p) => <select {...p} value={draft.state} onChange={set("state")}><option value="">Select state</option>{INDIAN_STATES.map((s) => <option key={s}>{s}</option>)}</select>}</Field>
          <label className="flex items-center gap-2 text-sm sm:col-span-2"><input type="checkbox" checked={draft.is_default} onChange={(e) => setDraft((d) => ({ ...d, is_default: e.target.checked }))} className="h-4 w-4 accent-terracotta" /> Make this my default address</label>
          <div className="flex gap-3 sm:col-span-2"><Button type="submit" loading={busy}>Save address</Button><Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button></div>
        </form>
      )}

      {list.length === 0 && editing === null ? (
        <EmptyState icon={<MapPin className="h-8 w-8" />} title="No saved addresses" text="Add an address to check out faster next time." actionLabel="Add address" onAction={() => open()} />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {list.map((a) => (
            <li key={a.id} className="card p-5">
              <div className="flex items-center justify-between">
                <p className="flex items-center gap-2 font-semibold"><MapPin className="h-4 w-4 text-terracotta" aria-hidden /> {a.label}</p>
                {a.is_default && <span className="rounded-full bg-forest-light px-2.5 py-0.5 text-xs font-semibold text-forest">Default</span>}
              </div>
              <address className="mt-3 text-sm not-italic leading-relaxed text-brown-soft">
                {a.full_name}<br />{a.line1}{a.line2 ? `, ${a.line2}` : ""}<br />{a.city}, {a.state} {a.pincode}<br />Phone: {a.phone}
              </address>
              <div className="mt-4 flex gap-3 text-sm">
                <button onClick={() => open(a)} className="font-medium text-terracotta underline">Edit</button>
                <button onClick={() => del(a)} className="inline-flex items-center gap-1 text-brown-soft hover:text-terracotta"><Trash2 className="h-3.5 w-3.5" aria-hidden /> Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
