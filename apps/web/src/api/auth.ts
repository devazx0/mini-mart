import { apiFetch } from "./client";
import type { LoginInput, SignupInput, User } from "./types";

export function signup(input: SignupInput): Promise<User> {
  return apiFetch<User>("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function login(input: LoginInput): Promise<User> {
  return apiFetch<User>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function refreshSession(): Promise<User> {
  return apiFetch<User>("/api/auth/refresh", { method: "POST" });
}

export function logout(): Promise<{ message: string }> {
  return apiFetch<{ message: string }>("/api/auth/logout", { method: "POST" });
}

export function fetchMe(): Promise<User> {
  return apiFetch<User>("/api/users/me");
}
