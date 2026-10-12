import { useEffect, useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ApiError } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { validateEmail, validateLoginPassword } from "../auth/validation";
import { AuthLayout, FormError, SubmitButton, TextField } from "../components/ui";

export function resolvePostLoginPath(role: string | undefined, next: string | undefined): string {
  const safeNext = next && next !== "/login" && next !== "/signup" ? next : undefined;
  if (role === "seller") {
    // Sellers always land on their dashboard. Only honor `next` if it's
    // itself a seller-allowed page, otherwise a stale `/shop` (saved by
    // RequireAuth before login) would bounce them to the storefront.
    if (safeNext && (safeNext === "/seller" || safeNext.startsWith("/seller/"))) return safeNext;
    return "/seller";
  }
  if (role === "admin") {
    if (
      safeNext &&
      (safeNext === "/admin" ||
        safeNext.startsWith("/admin/") ||
        safeNext === "/seller" ||
        safeNext.startsWith("/seller/"))
    )
      return safeNext;
    return "/admin";
  }
  // Buyers (default): honor `next` unless it points at a role-restricted page.
  if (
    safeNext &&
    safeNext !== "/seller" &&
    !safeNext.startsWith("/seller/") &&
    safeNext !== "/admin" &&
    !safeNext.startsWith("/admin/")
  )
    return safeNext;
  return "/";
}

export default function LoginPage() {
  const { user, loading: sessionLoading, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation() as { state?: { next?: string } };
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [serverFields, setServerFields] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const errors = { email: validateEmail(email), password: validateLoginPassword(password) };
  const show = (key: keyof typeof errors): string | null =>
    touched[key] ? (errors[key] ?? serverFields[key] ?? null) : (serverFields[key] ?? null);

  useEffect(() => {
    if (!sessionLoading && user) {
      navigate(resolvePostLoginPath(user.role, location.state?.next), { replace: true });
    }
  }, [user, sessionLoading, location.state?.next, navigate]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setTouched({ email: true, password: true });
    setServerFields({});
    setServerError(null);
    if (errors.email || errors.password) return;
    setLoading(true);
    try {
      const loggedIn = await login({ email: email.trim().toLowerCase(), password });
      navigate(resolvePostLoginPath(loggedIn.role, location.state?.next), { replace: true });
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setServerFields(err.fields);
        setServerError(err.status === 401 ? "Invalid email or password" : err.message);
      } else {
        setServerError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout eyebrow="User Login">
      <div className="flex flex-col items-center text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-container font-display text-2xl font-bold text-on-primary shadow-md">
          A
        </div>
        <h1 className="mt-3 font-display text-2xl font-semibold tracking-tight">Welcome back</h1>
        <p className="mt-1 max-w-xs text-sm text-on-surface-variant">
          Sign in to access your orders, inventory, and marketplace settlements.
        </p>
      </div>

      <div className="mt-5 rounded-xl bg-surface-container-lowest p-5 shadow-sm">
        <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
          <TextField
            id="email"
            label="Email Address"
            type="email"
            autoComplete="email"
            placeholder="merchant@apexmarket.ng"
            value={email}
            error={show("email")}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, email: true }))}
          />
          <TextField
            id="password"
            label="Password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••••••"
            value={password}
            error={show("password")}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, password: true }))}
          />
          <FormError message={serverError} />
          <SubmitButton loading={loading}>Sign in to Dashboard</SubmitButton>
        </form>

        <div className="my-4 flex items-center gap-2">
          <div className="h-px flex-1 bg-surface-container" />
          <span className="text-xs uppercase tracking-wider text-on-surface-variant">or continue with</span>
          <div className="h-px flex-1 bg-surface-container" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled
            title="Google sign-in is not available yet"
            className="h-10 rounded-lg bg-surface-container-low text-sm font-medium text-on-surface opacity-60"
          >
            Google (soon)
          </button>
          <button
            type="button"
            disabled
            title="Apple sign-in is not available yet"
            className="h-10 rounded-lg bg-surface-container-low text-sm font-medium text-on-surface opacity-60"
          >
            Apple ID (soon)
          </button>
        </div>
      </div>

      <p className="mt-4 text-center text-sm text-on-surface-variant">
        Don&apos;t have an account?{" "}
        <Link to="/signup" className="font-medium text-primary hover:underline">
          Create an account
        </Link>
      </p>
      <p className="mt-2 text-center text-xs text-on-surface-variant">
        Marketplace Administrator?{" "}
        <Link to="/admin" className="text-primary hover:underline">
          Access Admin Portal
        </Link>
      </p>
    </AuthLayout>
  );
}
