import Link from "next/link";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/format";

type Variant = "primary" | "outline" | "ghost" | "soft" | "forest";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary: "bg-terracotta text-white hover:bg-terracotta-dark shadow-soft",
  forest: "bg-forest text-white hover:bg-forest/90 shadow-soft",
  outline: "border border-forest/70 text-forest hover:bg-forest hover:text-white",
  soft: "bg-beige text-brown hover:bg-beige-dark",
  ghost: "text-brown hover:bg-beige/70",
};
const sizes: Record<Size, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-sm",
  lg: "px-8 py-3.5 text-base",
};

interface Common {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
}

type ButtonProps = Common &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children"> & { href?: undefined; loading?: boolean };
type LinkProps = Common & { href: string; loading?: undefined } & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "className" | "children" | "href">;

export default function Button(props: ButtonProps | LinkProps) {
  const { variant = "primary", size = "md", className, children, ...rest } = props;
  const classes = cn(
    "inline-flex items-center justify-center gap-2 rounded-full font-medium transition duration-200 disabled:cursor-not-allowed disabled:opacity-55 active:scale-[0.98]",
    variants[variant],
    sizes[size],
    className,
  );
  if ("href" in rest && rest.href !== undefined) {
    const { href, loading: _l, ...anchor } = rest as LinkProps;
    return (
      <Link href={href} className={classes} {...anchor}>
        {children}
      </Link>
    );
  }
  const { loading, disabled, type = "button", ...btn } = rest as ButtonProps;
  return (
    <button type={type} className={classes} disabled={disabled || loading} {...btn}>
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
}
