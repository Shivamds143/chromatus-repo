"use client";

import { FormEvent, useState } from "react";

const fields = [
  { name: "fullName", label: "Full name", type: "text", required: true },
  { name: "email", label: "Email", type: "email", required: true },
  { name: "phone", label: "Phone number", type: "tel", required: false },
  { name: "company", label: "Company name", type: "text", required: true },
];

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Status = "idle" | "loading" | "success" | "error";

export default function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    const payload = {
      fullName: (data.get("fullName") as string)?.trim() ?? "",
      email: (data.get("email") as string)?.trim() ?? "",
      phone: (data.get("phone") as string)?.trim() ?? "",
      company: (data.get("company") as string)?.trim() ?? "",
      message: (data.get("message") as string)?.trim() ?? "",
      // Honeypot: real visitors never fill this hidden field in.
      company_website: (data.get("company_website") as string) ?? "",
    };

    const nextErrors: Record<string, string> = {};
    if (!payload.fullName) nextErrors.fullName = "Let us know who's asking.";
    if (!payload.email) nextErrors.email = "We'll need an email to reply to.";
    else if (!emailPattern.test(payload.email)) nextErrors.email = "That doesn't look like a valid email.";
    if (!payload.company) nextErrors.company = "Which company is this for?";

    setErrors(nextErrors);
    setServerError("");
    if (Object.keys(nextErrors).length > 0) {
      setStatus("error");
      return;
    }

    setStatus("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json().catch(() => null);
      if (!res.ok || !result?.ok) {
        throw new Error(result?.error || "Request failed");
      }
      setStatus("success");
    } catch {
      setStatus("error");
      setServerError(
        "Something went wrong sending your request. Please try again, or call us directly."
      );
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-2xl border border-line bg-paper-dim p-10 text-center">
        <p className="font-display text-xl font-semibold text-ink">Request received.</p>
        <p className="mt-2 text-sm leading-relaxed text-slate">
          Someone from our team will get back to you within one business day.
          If it's urgent, call us directly at{" "}
          <a href="tel:+917498465144" className="font-medium text-indigo hover:text-indigo-light">
            +91 74984 65144
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {/* Honeypot field — hidden from real users, catches basic form spam bots. */}
      <input
        type="text"
        name="company_website"
        tabIndex={-1}
        autoComplete="off"
        className="absolute -left-[9999px] h-0 w-0 opacity-0"
        aria-hidden="true"
      />

      <div className="grid gap-5 sm:grid-cols-2">
        {fields.map((f) => (
          <label key={f.name} className="block">
            <span className="mono-tag text-slate">
              {f.label}
              {!f.required && <span className="text-slate/60"> (optional)</span>}
            </span>
            <input
              name={f.name}
              type={f.type}
              aria-invalid={Boolean(errors[f.name])}
              className={`mt-2 w-full rounded-lg border bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-indigo ${
                errors[f.name] ? "border-red-400" : "border-line"
              }`}
              placeholder={f.label}
            />
            {errors[f.name] && <p className="mt-1.5 text-xs text-red-600">{errors[f.name]}</p>}
          </label>
        ))}
      </div>
      <label className="block">
        <span className="mono-tag text-slate">What are you trying to figure out?</span>
        <textarea
          name="message"
          rows={5}
          className="mt-2 w-full resize-none rounded-lg border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-indigo"
          placeholder="A short description of the decision or question behind this project."
        />
      </label>
      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={status === "loading"}
          className="rounded-lg bg-indigo px-7 py-3.5 text-sm font-semibold text-paper transition hover:scale-[1.02] hover:bg-indigo-light active:scale-[0.98] disabled:opacity-60 disabled:hover:scale-100"
        >
          {status === "loading" ? "Sending…" : "Submit request"}
        </button>
        {status === "error" && Object.keys(errors).length > 0 && (
          <span className="text-xs text-red-600">Check the highlighted fields above.</span>
        )}
        {status === "error" && serverError && (
          <span className="text-xs text-red-600">{serverError}</span>
        )}
      </div>
    </form>
  );
}
