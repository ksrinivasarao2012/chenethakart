"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { api, ApiError, errorMessage } from "@/lib/api";
import type { Review } from "@/lib/types";
import Button from "../ui/Button";
import Field from "../ui/Field";
import Rating, { StarPicker } from "../ui/Rating";

interface Props {
  slug: string;
  rating: number;
  reviewCount: number;
  initial: Review[];
}

export default function Reviews({ slug, rating, reviewCount, initial }: Props) {
  const { user } = useAuth();
  const toast = useToast();
  const [reviews, setReviews] = useState(initial);
  const [stats, setStats] = useState({ rating, count: reviewCount });
  const [stars, setStars] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!stars) next.rating = "Please choose a star rating.";
    if (title.trim().length < 2) next.title = "Add a short headline.";
    if (body.trim().length < 10) next.body = "Tell us a little more (at least 10 characters).";
    setErrors(next);
    if (Object.keys(next).length) return;
    setBusy(true);
    try {
      const res = await api<{ rating: number; review_count: number }>(`/products/${slug}/reviews`, {
        method: "POST",
        json: { rating: stars, title, body },
      });
      setReviews((cur) => [
        { id: Date.now(), author: user?.name ?? "You", rating: stars, title, body, created_at: "Just now" },
        ...cur,
      ]);
      setStats({ rating: res.rating, count: res.review_count });
      setStars(0);
      setTitle("");
      setBody("");
      toast("Thanks — your review has been posted.");
    } catch (err) {
      if (err instanceof ApiError && Object.keys(err.fields).length) setErrors(err.fields);
      toast(errorMessage(err), "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section id="reviews" aria-labelledby="reviews-title" className="scroll-mt-28">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <h2 id="reviews-title" className="text-2xl font-semibold md:text-3xl">Customer reviews</h2>
        <Rating value={stats.rating} count={stats.count} size="md" />
      </div>
      <p className="mb-6 rounded-xl bg-beige/60 px-4 py-2.5 text-xs text-brown-soft">
        Sample reviews are shown for demonstration. Reviews you post while logged in are saved.
      </p>
      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <ul className="space-y-4">
          {reviews.map((r) => (
            <li key={r.id} className="card p-5">
              <div className="flex items-center justify-between gap-3">
                <Rating value={r.rating} />
                <span className="text-xs text-brown-soft">{r.created_at}</span>
              </div>
              <h3 className="mt-2 font-sans text-base font-semibold text-brown">{r.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-brown-soft">{r.body}</p>
              <p className="mt-3 text-xs font-medium text-brown">— {r.author}</p>
            </li>
          ))}
        </ul>

        <div className="card h-fit p-5">
          <h3 className="font-serif text-xl">Write a review</h3>
          {user ? (
            <form onSubmit={submit} noValidate className="mt-4 space-y-4">
              <div>
                <p className="mb-1.5 text-sm font-medium">Your rating</p>
                <StarPicker value={stars} onChange={setStars} />
                {errors.rating && <p role="alert" className="mt-1.5 text-xs text-terracotta">{errors.rating}</p>}
              </div>
              <Field label="Headline" id="rv-title" error={errors.title}>
                {(p) => <input {...p} value={title} onChange={(e) => setTitle(e.target.value)} maxLength={80} />}
              </Field>
              <Field label="Your review" id="rv-body" error={errors.body}>
                {(p) => <textarea {...p} rows={4} value={body} onChange={(e) => setBody(e.target.value)} maxLength={1000} />}
              </Field>
              <Button type="submit" loading={busy} className="w-full">Post review</Button>
            </form>
          ) : (
            <p className="mt-3 text-sm text-brown-soft">
              <Link href={`/login?next=/product/${slug}`} className="font-medium text-terracotta underline">Log in</Link> to share your experience with this product.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
