const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateName(value: string): string | null {
  const v = value.trim();
  if (!v) return "Required";
  if (v.length < 2) return "Must be at least 2 characters";
  if (v.length > 50) return "Must be at most 50 characters";
  return null;
}

export function validateEmail(value: string): string | null {
  const v = value.trim().toLowerCase();
  if (!v) return "Email is required";
  if (v.length > 255) return "Email is too long";
  if (!EMAIL_RE.test(v)) return "Enter a valid email address";
  return null;
}

export function validatePassword(value: string): string | null {
  if (!value) return "Password is required";
  if (value.length < 8) return "Password must be at least 8 characters";
  if (value.length > 72) return "Password must be at most 72 characters";
  if (!/(?=.*[A-Za-z])(?=.*\d)/.test(value))
    return "Password must contain at least one letter and one number";
  return null;
}

export function validateLoginPassword(value: string): string | null {
  if (!value) return "Password is required";
  return null;
}

export function normalizePhone(value: string): string | undefined {
  const raw = value.replace(/[\s-]/g, "");
  if (!raw) return undefined;
  if (raw.startsWith("+")) return raw.slice(0, 20);
  const digits = raw.replace(/\D/g, "");
  if (!digits) return undefined;
  return `+234${digits.replace(/^0+/, "").replace(/^234/, "")}`.slice(0, 20);
}

export function validatePhone(value: string): string | null {
  if (!value.trim()) return null;
  const normalized = normalizePhone(value) ?? "";
  if (normalized.length > 20) return "Phone number is too long";
  return null;
}

export function validateDob(value: string): string | null {
  if (!value) return "Date of birth is required";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "Enter a valid date";
  if (d >= new Date()) return "Date of birth must be in the past";
  return null;
}

export function dobToIso(value: string): string {
  return new Date(`${value}T00:00:00`).toISOString();
}

export function passwordScore(value: string): number {
  let score = 0;
  if (value.length >= 6) score += 1;
  if (value.length >= 10) score += 1;
  if (/[A-Z]/.test(value) && /[0-9]/.test(value)) score += 1;
  if (/[^A-Za-z0-9]/.test(value)) score += 1;
  return score;
}

export function strengthLabel(score: number): string {
  if (score <= 0) return "Requires 8+ characters";
  if (score === 1) return "Weak";
  if (score === 2) return "Moderate";
  if (score === 3) return "Good";
  return "Strong & Secure";
}
