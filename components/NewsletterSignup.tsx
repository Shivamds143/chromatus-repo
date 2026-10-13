"use client";

import { FormEvent, useState } from "react";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Status = "idle" | "loading" | "sent" | "error";

export default function NewsletterSignup() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    const email = (data.get("email") as string)?.trim() ?? "";
    // Honeypot field — real visitors never fill this in.
    const honeypot = (data.get("website") as string) ?? "";

    if (!emailPattern.test(email)) {
      setError("Enter a valid email address.");
      setStatus("error");
      return;
    }

    setError("");
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, website: honeypot }),
      });
      const result = await res.json().catch(() => null);
      if (!res.ok || !result?.ok) {
        throw new Error(result?.error || "Request failed");
      }
      setStatus("sent");
    } catch {
      setStatus("error");
      setError("Something went wrong — please try again.");
    }
  }

  if (status === "sent") {
    return <p className="text-sm text-paper/60">You&rsquo;re on the list — thanks for signing up.</p>;
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="max-w-sm">
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="absolute -left-[9999px] h-0 w-0 opacity-0"
        aria-hidden="true"
      />
      <div className="flex gap-2">
        <input
          type="email"
          name="email"
          required
          placeholder="you@company.com"
          className={`w-full rounded-full border bg-paper/5 px-4 py-2.5 text-sm text-paper placeholder:text-paper/35 outline-none focus:border-signal ${
            status === "error" ? "border-red-400/60" : "border-paper/15"
          }`}
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="flex-shrink-0 rounded-full bg-signal px-5 py-2.5 text-sm font-semibold text-ink transition hover:scale-[1.03] hover:bg-signal-light active:scale-[0.98] disabled:opacity-60 disabled:hover:scale-100"
        >
          {status === "loading" ? "…" : "Sign up"}
        </button>
      </div>
      {status === "error" && <p className="mt-2 text-xs text-red-400">{error}</p>}
    </form>
  );
}
