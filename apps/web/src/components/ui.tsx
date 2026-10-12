import { useState, type InputHTMLAttributes, type ReactNode } from "react";

export function AuthLayout({ eyebrow, children }: { eyebrow: string; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <header className="sticky top-0 z-50 border-b border-surface-container bg-surface/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-container font-display text-lg font-bold text-on-primary">
              A
            </div>
            <div className="leading-tight">
              <p className="font-display text-base font-semibold tracking-tight">ApexMarket</p>
              <p className="text-xs text-on-surface-variant">{eyebrow}</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-container px-2.5 py-1 text-xs font-medium text-secondary">
            <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
            Secure Sign Up
          </span>
        </div>
      </header>
      <main className="mx-auto w-full max-w-xl px-4 pb-10 pt-6">{children}</main>
    </div>
  );
}

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string | null;
  hint?: string;
}

export function TextField({ label, error, hint, id, ...rest }: FieldProps) {
  const [visible, setVisible] = useState(false);
  const isPassword = rest.type === "password";
  const type = isPassword ? (visible ? "text" : "password") : rest.type;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-semibold uppercase tracking-wider text-on-surface">
        {label}
      </label>
      <div
        className={`relative flex items-center rounded-lg bg-surface-container-lowest shadow-sm ring-1 ring-transparent focus-within:ring-2 focus-within:ring-primary/30 ${
          error ? "ring-2 ring-error/50" : ""
        }`}
      >
        <input
          id={id}
          {...rest}
          type={type}
          aria-invalid={Boolean(error)}
          className="h-11 w-full bg-transparent px-3 text-sm font-medium text-on-surface outline-none placeholder:text-outline"
        />
        {isPassword && (
          <button
            type="button"
            aria-label={visible ? "Hide password" : "Show password"}
            onClick={() => setVisible((v) => !v)}
            className="material-symbols-outlined absolute right-2.5 p-1 text-lg text-on-surface-variant hover:text-on-surface"
          >
            {visible ? "visibility_off" : "visibility"}
          </button>
        )}
      </div>
      {error ? (
        <p role="alert" className="text-xs text-error">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-on-surface-variant">{hint}</p>
      ) : null}
    </div>
  );
}

export function FormError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p role="alert" className="rounded-lg bg-error-container px-3 py-2 text-sm text-on-error-container">
      {message}
    </p>
  );
}

export function SubmitButton({ loading, children }: { loading: boolean; children: ReactNode }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-medium text-on-primary shadow-md transition-all hover:bg-primary-container active:scale-[0.99] disabled:opacity-60"
    >
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-on-primary border-t-transparent" />
      ) : null}
      <span>{children}</span>
      <span className="material-symbols-outlined text-lg">arrow_forward</span>
    </button>
  );
}
