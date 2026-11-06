export const formatINR = (n: number) => `₹${n.toLocaleString("en-IN")}`;

export const discountPercent = (price: number, compare: number | null) =>
  compare && compare > price ? Math.round(((compare - price) / compare) * 100) : 0;

export const cn = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(" ");

export const initials = (name: string) =>
  name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
