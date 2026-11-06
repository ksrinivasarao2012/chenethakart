export type Errors<T extends string = string> = Partial<Record<T, string>>;

export const isEmail = (v: string) => /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(v.trim());
export const isPhone = (v: string) => /^[6-9]\d{9}$/.test(v.trim());
export const isPincode = (v: string) => /^[1-9]\d{5}$/.test(v.trim());
export const isUpi = (v: string) => /^[\w.\-]{2,}@[a-zA-Z]{2,}$/.test(v.trim());

export function luhn(num: string) {
  const digits = num.replace(/\s+/g, "");
  if (!/^\d{13,19}$/.test(digits)) return false;
  let sum = 0;
  let alt = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = Number(digits[i]);
    if (alt) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    alt = !alt;
  }
  return sum % 10 === 0;
}

export function isFutureExpiry(v: string) {
  const m = /^(\d{2})\s*\/\s*(\d{2})$/.exec(v.trim());
  if (!m) return false;
  const month = Number(m[1]);
  const year = 2000 + Number(m[2]);
  if (month < 1 || month > 12) return false;
  const end = new Date(year, month, 1);
  return end.getTime() > Date.now();
}

export const required = (v: string, label: string, min = 1) =>
  v.trim().length < min ? (min > 1 ? `${label} must be at least ${min} characters.` : `${label} is required.`) : undefined;
