"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Lato } from "next/font/google";

const lato = Lato({
  subsets: ["latin"],
  weight: ["400", "700"],
});

const ADMIN_EMAILS = new Set([
  "scah.club@gmail.com",
  "oghoghenero0@gmail.com",
]);

type LoginResponse = {
  token?: string;
  accessToken?: string;
  user?: Record<string, unknown>;
  role?: string;
  data?: {
    token?: string;
    accessToken?: string;
    user?: Record<string, unknown>;
    role?: string;
    message?: unknown;
    error?: unknown;
  };
  message?: unknown;
  error?: unknown;
};

const getErrorMessage = (body: LoginResponse, status: number) => {
  if (status === 401) return "Credentials wrong";
  if (status === 403) return "Unauthorized";

  const candidates = [
    body.message,
    body.error,
    body.data?.message,
    body.data?.error,
  ];
  const message = candidates
    .map(getTextMessage)
    .find((candidate) => candidate !== undefined);

  if (typeof message !== "string") {
    return "Unable to sign in. Please try again.";
  }

  if (/unauthori[sz]ed|forbidden|not allowed|access denied/i.test(message)) {
    return "Unauthorized";
  }
  if (
    /invalid credentials|incorrect credentials|wrong credentials|invalid email or password|email or password/i.test(
      message,
    )
  ) {
    return "Credentials wrong";
  }

  return message;
};

function getTextMessage(value: unknown): string | undefined {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (!value || typeof value !== "object") return undefined;

  const fields = value as Record<string, unknown>;
  for (const key of ["message", "error", "detail"]) {
    if (key in fields) {
      const message = getTextMessage(fields[key]);
      if (message) return message;
    }
  }

  return undefined;
}

export default function Home() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "");

    if (!ADMIN_EMAILS.has(email.toLowerCase())) {
      setError("Unauthorized");
      setIsSubmitting(false);
      return;
    }

    if (!apiUrl) {
      setError("The API URL is not configured. Please contact your administrator.");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const body = (await response.json().catch(() => ({}))) as LoginResponse;

      if (!response.ok) {
        throw new Error(getErrorMessage(body, response.status));
      }

      const payload = body.data ?? body;
      const token = payload.token ?? payload.accessToken;
      if (!token) {
        throw new Error(
          getTextMessage(body.message) ||
            "The login response did not include an access token.",
        );
      }

      localStorage.setItem("token", token);
      if (payload.user) localStorage.setItem("user", JSON.stringify(payload.user));
      if (payload.role) localStorage.setItem("role", payload.role);

      const requestedPath = new URLSearchParams(window.location.search).get("redirectTo");
      const destination = requestedPath?.startsWith("/") && !requestedPath.startsWith("//")
        ? requestedPath
        : "/dashboard";
      router.replace(destination);
    } catch (loginError) {
      setError(
        loginError instanceof Error
          ? loginError.message
          : "Unable to sign in. Check your connection and try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className={`${lato.className} flex min-h-screen items-center justify-center bg-[#0b1220] px-4 py-10 text-[#f2f4f7]`}>
      <div className="w-full max-w-md">
        <div className="mb-7 flex items-center justify-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#7ddc5a] text-xl font-bold text-[#0b1220]">
            S
          </span>
          <span className="text-xl font-bold tracking-tight text-white">
            SCAH <span className="text-[#a3acba]">Admin</span>
          </span>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-[#111a2b] p-7 shadow-xl shadow-black/20 sm:p-9">
          <div className="mb-8">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#7ddc5a]">
              Admin portal
            </p>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Welcome back
            </h1>
            <p className="mt-2 text-sm leading-6 text-[#a3acba]">
              Sign in to manage your SCAH community.
            </p>
          </div>

          {error && (
            <p role="alert" className="mb-5 rounded-xl border border-red-400/20 bg-red-500/[0.08] px-3.5 py-3 text-sm text-red-300">
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-[#d0d5dc]"
              >
                Email
              </label>

              <input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                required
                className="h-11 w-full rounded-xl border border-white/[0.1] bg-[#0b1220] px-3.5 text-sm text-white outline-none transition placeholder:text-[#76808e] focus:border-[#7ddc5a]/70 focus:ring-2 focus:ring-[#7ddc5a]/15"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold text-[#d0d5dc]"
              >
                Password
              </label>

              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  required
                  className="h-11 w-full rounded-xl border border-white/[0.1] bg-[#0b1220] px-3.5 pr-20 text-sm text-white outline-none transition placeholder:text-[#76808e] focus:border-[#7ddc5a]/70 focus:ring-2 focus:ring-[#7ddc5a]/15"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#8e98a7] transition hover:text-white"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                className="text-sm font-semibold text-[#a3acba] transition hover:text-[#a5ed8c]"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="h-11 w-full rounded-xl bg-[#7ddc5a] text-sm font-bold text-[#0b1220] transition hover:bg-[#69c94b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7ddc5a] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-[#6f7885]">
          Secure access for SCAH administrators
        </p>
      </div>
    </main>
  );
}
