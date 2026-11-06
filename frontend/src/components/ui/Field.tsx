import { cn } from "@/lib/format";

interface FieldProps {
  label: string;
  id: string;
  error?: string;
  hint?: string;
  className?: string;
  children: (props: { id: string; className: string; "aria-invalid": boolean; "aria-describedby"?: string }) => React.ReactNode;
}

/** Label + control + inline error. Children receives the props the control should spread. */
export default function Field({ label, id, error, hint, className, children }: FieldProps) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-brown">
        {label}
      </label>
      {children({ id, className: cn("input", error && "input-error"), "aria-invalid": !!error, "aria-describedby": describedBy })}
      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-xs text-terracotta">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-brown-soft">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
