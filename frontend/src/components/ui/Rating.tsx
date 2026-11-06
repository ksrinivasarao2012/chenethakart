import { Star } from "lucide-react";

export default function Rating({ value, count, size = "sm" }: { value: number; count?: number; size?: "sm" | "md" }) {
  const dim = size === "md" ? "h-4 w-4" : "h-3.5 w-3.5";
  return (
    <span className="inline-flex items-center gap-1.5" aria-label={`Rated ${value.toFixed(1)} out of 5${count ? ` from ${count} reviews` : ""}`}>
      <Star className={`${dim} fill-[#E2A23B] text-[#E2A23B]`} aria-hidden />
      <span className={`font-semibold text-brown ${size === "md" ? "text-sm" : "text-xs"}`}>{value.toFixed(1)}</span>
      {count !== undefined && <span className={`text-brown-soft ${size === "md" ? "text-sm" : "text-xs"}`}>({count})</span>}
    </span>
  );
}

export function StarPicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <div className="flex gap-1" role="radiogroup" aria-label="Your rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} star${n > 1 ? "s" : ""}`}
          onClick={() => onChange(n)}
          className="rounded p-0.5"
        >
          <Star className={`h-7 w-7 transition ${n <= value ? "fill-[#E2A23B] text-[#E2A23B]" : "text-beige-dark"}`} />
        </button>
      ))}
    </div>
  );
}
