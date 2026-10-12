export class ApiError extends Error {
  status: number;
  fields: Record<string, string>;
  constructor(status: number, message: string, fields: Record<string, string> = {}) {
    super(message);
    this.status = status;
    this.fields = fields;
  }
}

function toFields(message: unknown): Record<string, string> {
  const fields: Record<string, string> = {};
  const list = Array.isArray(message) ? message : [message];
  for (const m of list) {
    if (typeof m !== "string") continue;
    const lower = m.toLowerCase();
    if (lower.includes("email")) fields.email = m;
    else if (lower.includes("password")) fields.password = m;
    else if (lower.includes("first")) fields.firstName = m;
    else if (lower.includes("last")) fields.lastName = m;
    else if (lower.includes("phone")) fields.phone = m;
    else if (lower.includes("dob") || lower.includes("date")) fields.dob = m;
    else if (lower.includes("role")) fields.role = m;
    else fields.form = fields.form ? `${fields.form} ${m}` : m;
  }
  return fields;
}

async function parseError(res: Response): Promise<never> {
  let message = `Request failed with ${res.status}`;
  let fields: Record<string, string> = {};
  try {
    const body = (await res.json()) as { message?: unknown };
    if (typeof body.message === "string") {
      message = body.message;
      fields = toFields(body.message);
    } else if (Array.isArray(body.message)) {
      const msgs = body.message.filter((m): m is string => typeof m === "string");
      message = msgs.join(" ");
      fields = toFields(msgs);
    }
  } catch {
    // keep default message
  }
  if (res.status === 409) {
    message = "Email already registered";
    fields.email = message;
  } else if (res.status === 401 && !fields.form) {
    fields.form = message;
  }
  throw new ApiError(res.status, message, fields);
}

let refreshPromise: Promise<unknown> | null = null;

function doRefresh(): Promise<unknown> {
  if (!refreshPromise) {
    refreshPromise = fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "include",
    }).then((r) => {
      refreshPromise = null;
      if (!r.ok) throw new Error("refresh failed");
      return r.json().catch(() => ({}));
    }).catch((e: unknown) => {
      refreshPromise = null;
      throw e;
    });
  }
  return refreshPromise;
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(path, {
    ...init,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(init.headers ?? {}) },
  });
  if (res.status === 401 && !path.endsWith("/auth/refresh") && !path.endsWith("/auth/login")) {
    try {
      await doRefresh();
      const retry = await fetch(path, {
        ...init,
        credentials: "include",
        headers: { "Content-Type": "application/json", ...(init.headers ?? {}) },
      });
      if (!retry.ok) await parseError(retry);
      if (retry.status === 204) return undefined as T;
      return (await retry.json()) as T;
    } catch {
      await parseError(res);
    }
  }
  if (!res.ok) await parseError(res);
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
