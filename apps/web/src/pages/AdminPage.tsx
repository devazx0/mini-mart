import { useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ApiError } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { validateEmail, validateLoginPassword } from "../auth/validation";
import { AuthLayout, FormError, SubmitButton, TextField } from "../components/ui";

export default function AdminPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const inputs = useRef<Array<HTMLInputElement | null>>([]);
  const [touched, setTouched] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const emailError = validateEmail(email);
  const passwordError = validateLoginPassword(password);

  function setDigit(i: number, v: string) {
    const digit = v.replace(/\D/g, "").slice(-1);
    setOtp((prev) => {
      const next = [...prev];
      next[i] = digit;
      return next;
    });
    if (digit && i < 5) inputs.current[i + 1]?.focus();
  }

  function onOtpKey(i: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !otp[i] && i > 0) inputs.current[i - 1]?.focus();
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setTouched(true);
    setServerError(null);
    if (emailError || passwordError) return;
    setLoading(true);
    try {
      // Backend has no 2FA: OTP inputs are UI-only and not submitted.
      const user = await login({ email: email.trim().toLowerCase(), password });
      if (user.role !== "admin") {
        setServerError("This account is not an administrator.");
        return;
      }
      navigate("/", { replace: true });
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setServerError(err.status === 401 ? "Invalid admin credentials" : err.message);
      } else {
        setServerError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout eyebrow="Admin Login">
      <div className="rounded-xl bg-inverse-surface p-5 text-inverse-on-surface">
        <span className="inline-flex items-center rounded bg-primary px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-on-primary">
          Admin Console
        </span>
        <h1 className="mt-2 font-display text-xl font-semibold tracking-tight">Operations &amp; Settlements</h1>
        <p className="mt-1 text-sm text-inverse-on-surface/80">
          Authorized staff credentials grant access to disputes, payout ledgers, and catalog governance.
        </p>
      </div>

      <div className="mt-4 rounded-xl bg-surface-container-lowest p-5 shadow-sm">
        <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
          <TextField
            id="adminEmail"
            label="Admin Email / Staff ID"
            type="email"
            autoComplete="username"
            placeholder="admin.ops@apexmarket.ng"
            value={email}
            error={touched ? emailError : null}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            id="adminPass"
            label="Admin Security Password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••••••••••"
            value={password}
            error={touched ? passwordError : null}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-on-surface">
              Hardware 2FA / Authenticator Code
            </label>
            <div className="mt-1.5 grid grid-cols-6 gap-1.5" aria-label="One-time passcode (not yet enforced)">
              {otp.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    inputs.current[i] = el;
                  }}
                  inputMode="numeric"
                  maxLength={1}
                  value={d}
                  placeholder="•"
                  aria-label={`Digit ${i + 1}`}
                  onChange={(e) => setDigit(i, e.target.value)}
                  onKeyDown={(e) => onOtpKey(i, e)}
                  className="h-12 rounded-lg bg-surface-container-low text-center font-display text-lg font-semibold text-on-surface outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/40"
                />
              ))}
            </div>
            <p className="mt-1 text-xs text-on-surface-variant">
              2FA is not yet enforced by the API — this field is UI-only for now.
            </p>
          </div>
          <FormError message={serverError} />
          <SubmitButton loading={loading}>Authenticate &amp; Open Console</SubmitButton>
        </form>
      </div>

      <p className="mt-4 text-center text-sm text-on-surface-variant">
        <Link to="/login" className="text-primary hover:underline">
          Return to user login
        </Link>
      </p>
    </AuthLayout>
  );
}
