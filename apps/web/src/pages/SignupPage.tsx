import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ApiError } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import {
  dobToIso,
  normalizePhone,
  passwordScore,
  strengthLabel,
  validateDob,
  validateEmail,
  validateName,
  validatePassword,
  validatePhone,
} from "../auth/validation";
import { AuthLayout, FormError, SubmitButton, TextField } from "../components/ui";

type Role = "customer" | "seller";

export default function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>("customer");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [serverFields, setServerFields] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const errors = {
    firstName: validateName(firstName),
    lastName: validateName(lastName),
    email: validateEmail(email),
    phone: validatePhone(phone),
    dob: validateDob(dob),
    password: validatePassword(password),
  };
  const show = (key: keyof typeof errors): string | null =>
    touched[key] ? (errors[key] ?? serverFields[key] ?? null) : (serverFields[key] ?? null);

  const score = passwordScore(password);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setTouched({ firstName: true, lastName: true, email: true, phone: true, dob: true, password: true });
    setServerFields({});
    setServerError(null);
    if (Object.values(errors).some(Boolean)) return;
    setLoading(true);
    try {
      const user = await signup({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        password,
        phone: normalizePhone(phone),
        dob: dobToIso(dob),
        role: role === "customer" ? "buyer" : "seller",
      });
      navigate(user.role === "seller" ? "/seller" : user.role === "admin" ? "/admin" : "/", { replace: true });
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setServerFields(err.fields);
        setServerError(err.fields.form ?? err.message);
      } else {
        setServerError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  const barColor = (i: number): string => {
    if (score <= i) return "bg-surface-container-highest";
    if (score === 1) return "bg-error";
    if (score === 2) return "bg-tertiary-container";
    if (score === 3) return "bg-primary";
    return "bg-secondary";
  };

  return (
    <AuthLayout eyebrow="User Signup">
      <h1 className="font-display text-xl font-semibold tracking-tight">Create your account</h1>
      <p className="mt-1 text-sm text-on-surface-variant">
        Join thousands of buyers and verified sellers across Nigeria.
      </p>

      <div className="mt-4 rounded-xl bg-surface-container-low p-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold uppercase tracking-wider text-primary">Step 1 of 2: Personal Details &amp; Role</span>
          <span className="text-on-surface-variant">50% completed</span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-container-highest">
          <div className="h-full w-1/2 rounded-full bg-primary" />
        </div>
      </div>

      <div className="mt-5" role="radiogroup" aria-label="Select your account type">
        <p className="font-display text-base font-semibold">Select your account type</p>
        <div className="mt-2 grid grid-cols-1 gap-2">
          {(["customer", "seller"] as Role[]).map((r) => (
            <button
              key={r}
              type="button"
              role="radio"
              aria-checked={role === r}
              onClick={() => setRole(r)}
              className={`flex items-start gap-3 rounded-xl p-3 text-left shadow-sm transition-all ${
                role === r ? "bg-primary-container/20 ring-2 ring-primary/40" : "bg-surface-container-lowest hover:bg-surface-container-low"
              }`}
            >
              <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${role === r ? "bg-primary" : "bg-surface-container-highest"}`}>
                <span className={`h-2 w-2 rounded-full ${role === r ? "bg-on-primary" : "bg-transparent"}`} />
              </span>
              <span>
                <span className="font-display text-sm font-semibold">
                  {r === "customer" ? "Customer (Buyer)" : "Business Owner (Seller)"}
                </span>
                <span className="block text-sm text-on-surface-variant">
                  {r === "customer"
                    ? "Discover products, purchase securely, and track orders."
                    : "List products, manage inventory, and receive payouts."}
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={onSubmit} noValidate className="mt-5 flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-2">
          <TextField
            id="firstName"
            label="First Name"
            placeholder="Adebayo"
            value={firstName}
            error={show("firstName")}
            onChange={(e) => setFirstName(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, firstName: true }))}
          />
          <TextField
            id="lastName"
            label="Last Name"
            placeholder="Okonkwo"
            value={lastName}
            error={show("lastName")}
            onChange={(e) => setLastName(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, lastName: true }))}
          />
        </div>
        <TextField
          id="email"
          label="Email Address"
          type="email"
          autoComplete="email"
          placeholder="adebayo@business.ng"
          value={email}
          error={show("email")}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, email: true }))}
        />
        <TextField
          id="phone"
          label="Phone Number (optional)"
          type="tel"
          placeholder="801 234 5678"
          value={phone}
          error={show("phone")}
          hint="🇳🇬 +234 prefix applied automatically"
          onChange={(e) => setPhone(e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
        />
        <TextField
          id="dob"
          label="Date of Birth"
          type="date"
          value={dob}
          error={show("dob")}
          hint="Must be a date in the past"
          onChange={(e) => setDob(e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, dob: true }))}
        />
        <div>
          <TextField
            id="password"
            label="Password"
            type="password"
            autoComplete="new-password"
            placeholder="Create a strong password"
            value={password}
            error={show("password")}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, password: true }))}
          />
          <div className="mt-2 flex gap-1.5">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${barColor(i)}`} />
            ))}
          </div>
          <p className="mt-1 text-xs text-on-surface-variant">{strengthLabel(score)}</p>
        </div>
        <FormError message={serverError} />
        <SubmitButton loading={loading}>Create Account &amp; Continue</SubmitButton>
        <p className="text-center text-sm text-on-surface-variant">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Sign In
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
