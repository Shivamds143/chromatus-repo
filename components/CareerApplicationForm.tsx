"use client";

import { ChangeEvent, DragEvent, FormEvent, useState, useRef, useEffect } from "react";

type Props = {
  initialPosition?: string;
  className?: string;
  onResetPosition?: () => void;
};

const defaultPositionOptions = [
  "Business Developer",
  "Market Research Analyst",
  "Senior Data Analyst",
  "Data Scientist",
  "Field Operations Specialist",
  "B2B Research & Consulting",
  "Secondary Research Specialist",
  "General / Open Application",
  "Other Position",
];

const experienceLevels = [
  "Fresh Graduate / 0-1 Year",
  "1 - 3 Years",
  "3 - 5 Years",
  "5 - 8 Years",
  "8+ Years",
];

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_EXTENSIONS = [".pdf", ".doc", ".docx"];

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function CareerApplicationForm({
  initialPosition,
  className = "",
  onResetPosition,
}: Props) {
  const [selectedPosition, setSelectedPosition] = useState(
    initialPosition || defaultPositionOptions[0]
  );

  useEffect(() => {
    if (initialPosition) {
      setSelectedPosition(initialPosition);
    }
  }, [initialPosition]);

  // Ensure initialPosition is always an option in the dropdown
  const positionOptions = Array.from(
    new Set(
      initialPosition && !defaultPositionOptions.includes(initialPosition)
        ? [initialPosition, ...defaultPositionOptions]
        : defaultPositionOptions
    )
  );
  const [experience, setExperience] = useState(experienceLevels[0]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  function validateFile(file: File): boolean {
    const ext = "." + file.name.split(".").pop()?.toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      setFileError("Only PDF (.pdf) and Word documents (.doc, .docx) are allowed.");
      return false;
    }
    if (file.size > MAX_FILE_SIZE) {
      setFileError("File size exceeds 10MB limit.");
      return false;
    }
    setFileError("");
    return true;
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      if (validateFile(file)) {
        setSelectedFile(file);
      } else {
        setSelectedFile(null);
      }
    }
  }

  function handleDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (validateFile(file)) {
        setSelectedFile(file);
      } else {
        setSelectedFile(null);
      }
    }
  }

  function removeFile() {
    setSelectedFile(null);
    setFileError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formValues = new FormData(form);

    const fullName = (formValues.get("fullName") as string)?.trim() || "";
    const email = (formValues.get("email") as string)?.trim() || "";
    const phone = (formValues.get("phone") as string)?.trim() || "";
    const message = (formValues.get("message") as string)?.trim() || "";
    const honeypot = (formValues.get("company_website") as string) || "";

    const nextErrors: Record<string, string> = {};
    if (!fullName) nextErrors.fullName = "Please enter your full name.";
    if (!email) nextErrors.email = "Please enter your email address.";
    else if (!emailPattern.test(email)) nextErrors.email = "Please enter a valid email address.";

    if (!selectedFile) {
      nextErrors.file = "Please attach your resume or CV.";
    }

    setErrors(nextErrors);
    setServerError("");

    if (Object.keys(nextErrors).length > 0) {
      setStatus("error");
      return;
    }

    setStatus("loading");

    try {
      const uploadData = new FormData();
      uploadData.append("fullName", fullName);
      uploadData.append("email", email);
      uploadData.append("phone", phone);
      uploadData.append("position", selectedPosition);
      uploadData.append("experience", experience);
      uploadData.append("message", message);
      uploadData.append("company_website", honeypot);
      if (selectedFile) {
        uploadData.append("resume", selectedFile);
      }

      const res = await fetch("/api/careers/apply", {
        method: "POST",
        body: uploadData,
      });

      const result = await res.json().catch(() => null);

      if (!res.ok || !result?.ok) {
        throw new Error(result?.error || "Failed to submit application. Please try again.");
      }

      setStatus("success");
    } catch (err: any) {
      setStatus("error");
      setServerError(
        err?.message || "Something went wrong while submitting your application. Please try again."
      );
    }
  }

  function resetForm() {
    setStatus("idle");
    setSelectedFile(null);
    setFileError("");
    setErrors({});
    setServerError("");
  }

  if (status === "success") {
    return (
      <div className={`rounded-2xl border border-emerald-200 bg-emerald-50/70 p-8 sm:p-12 text-center ${className}`}>
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h3 className="mt-5 font-display text-2xl font-bold text-ink sm:text-3xl">
          Application & CV Received!
        </h3>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-slate sm:text-base">
          Thank you for applying to <span className="font-semibold text-ink">Chromatus Consulting</span>. 
          Our hiring team has safely received your resume and details. If your experience aligns with our current requirements, we will reach out to you directly.
        </p>
        <div className="mt-8">
          <button
            type="button"
            onClick={resetForm}
            className="inline-flex items-center gap-2 rounded-lg border border-line bg-white px-5 py-2.5 text-xs font-semibold text-ink shadow-xs transition hover:bg-paper"
          >
            Submit Another Application
          </button>
        </div>
      </div>
    );
  }

  return (
    <div id="apply-form" className={`rounded-2xl border border-line bg-white p-6 sm:p-10 shadow-sm ${className}`}>
      <div className="border-b border-line pb-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs font-bold uppercase tracking-wider text-indigo">Join Our Team</p>
          {selectedPosition && selectedPosition !== "General / Open Application" && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 border border-emerald-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
              Applying for: {selectedPosition}
              {onResetPosition && (
                <button
                  type="button"
                  onClick={onResetPosition}
                  className="ml-1 text-slate-700 hover:text-ink font-semibold underline"
                  title="Switch to general application"
                >
                  (change)
                </button>
              )}
            </span>
          )}
        </div>
        <h2 className="mt-1 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          {selectedPosition && selectedPosition !== "General / Open Application"
            ? `Apply for ${selectedPosition}`
            : "Upload Your Resume / CV"}
        </h2>
        <p className="mt-2 text-sm font-medium text-slate-700">
          Submit your profile for current openings or general consideration. We review all applications directly.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-6">
        {/* Anti-spam honeypot */}
        <input
          type="text"
          name="company_website"
          tabIndex={-1}
          autoComplete="off"
          className="absolute -left-[9999px] h-0 w-0 opacity-0"
          aria-hidden="true"
        />

        <div className="grid gap-5 sm:grid-cols-2">
          {/* Full Name */}
          <label className="block">
            <span className="block text-sm font-bold text-ink mb-1.5">
              Full Name <span className="text-red-500">*</span>
            </span>
            <input
              name="fullName"
              type="text"
              required
              placeholder="e.g. John Doe"
              aria-invalid={Boolean(errors.fullName)}
              className={`mt-1 w-full rounded-lg border bg-white px-4 py-3 text-sm font-semibold text-ink placeholder:font-normal placeholder:text-slate-400 outline-none transition focus:border-indigo focus:ring-1 focus:ring-indigo ${
                errors.fullName ? "border-red-400" : "border-slate-300"
              }`}
            />
            {errors.fullName && <p className="mt-1 text-xs font-semibold text-red-600">{errors.fullName}</p>}
          </label>

          {/* Email Address */}
          <label className="block">
            <span className="block text-sm font-bold text-ink mb-1.5">
              Email Address <span className="text-red-500">*</span>
            </span>
            <input
              name="email"
              type="email"
              required
              placeholder="you@domain.com"
              aria-invalid={Boolean(errors.email)}
              className={`mt-1 w-full rounded-lg border bg-white px-4 py-3 text-sm font-semibold text-ink placeholder:font-normal placeholder:text-slate-400 outline-none transition focus:border-indigo focus:ring-1 focus:ring-indigo ${
                errors.email ? "border-red-400" : "border-slate-300"
              }`}
            />
            {errors.email && <p className="mt-1 text-xs font-semibold text-red-600">{errors.email}</p>}
          </label>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {/* Phone Number */}
          <label className="block">
            <span className="block text-sm font-bold text-ink mb-1.5">
              Phone Number <span className="text-xs font-normal text-slate-500">(optional)</span>
            </span>
            <input
              name="phone"
              type="tel"
              placeholder="+91 98765 43210"
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-ink placeholder:font-normal placeholder:text-slate-400 outline-none transition focus:border-indigo focus:ring-1 focus:ring-indigo"
            />
          </label>

          {/* Experience Level */}
          <label className="block">
            <span className="block text-sm font-bold text-ink mb-1.5">Years of Experience</span>
            <select
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-ink outline-none transition focus:border-indigo focus:ring-1 focus:ring-indigo cursor-pointer"
            >
              {experienceLevels.map((lvl) => (
                <option key={lvl} value={lvl} className="font-medium text-ink">
                  {lvl}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div>
          {/* Role / Position */}
          <label className="block">
            <span className="block text-sm font-bold text-ink mb-1.5">Role of Interest</span>
            <select
              value={selectedPosition}
              onChange={(e) => setSelectedPosition(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-ink outline-none transition focus:border-indigo focus:ring-1 focus:ring-indigo cursor-pointer"
            >
              {positionOptions.map((opt) => (
                <option key={opt} value={opt} className="font-medium text-ink">
                  {opt}
                </option>
              ))}
            </select>
          </label>
        </div>

        {/* Resume / CV File Upload Box */}
        <div className="block">
          <div className="flex items-center justify-between mb-1.5">
            <span className="block text-sm font-bold text-ink">
              Upload Resume / CV (PDF or DOCX, max 10MB) <span className="text-red-500">*</span>
            </span>
            {selectedFile && (
              <span className="text-xs font-bold text-emerald-700">File Selected</span>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            name="resume"
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={handleFileChange}
            className="hidden"
          />

          {!selectedFile ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`mt-1 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition ${
                isDragging
                  ? "border-indigo bg-indigo-50/50"
                  : errors.file
                  ? "border-red-400 bg-red-50/20"
                  : "border-slate-300 bg-slate-50/60 hover:border-indigo hover:bg-slate-50"
              }`}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm text-indigo">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </div>
              <p className="mt-3 text-base font-bold text-ink">
                Click to browse or drag and drop your resume here
              </p>
              <p className="mt-1 text-xs font-medium text-slate-600">
                Supported formats: PDF (.pdf), Microsoft Word (.doc, .docx) &bull; Maximum 10MB
              </p>
            </div>
          ) : (
            <div className="mt-1 flex items-center justify-between rounded-xl border border-slate-300 bg-slate-50 p-4">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-indigo text-white font-bold text-xs shadow-xs">
                  {selectedFile.name.endsWith(".pdf") ? "PDF" : "DOC"}
                </div>
                <div className="overflow-hidden">
                  <p className="truncate text-sm font-bold text-ink">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs font-semibold text-slate-600 font-mono">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-ink hover:bg-slate-100 transition shadow-2xs"
                >
                  Change
                </button>
                <button
                  type="button"
                  onClick={removeFile}
                  className="rounded-md border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-bold text-red-700 hover:bg-red-100 transition"
                  title="Remove file"
                >
                  Remove
                </button>
              </div>
            </div>
          )}

          {fileError && <p className="mt-1.5 text-xs font-semibold text-red-600">{fileError}</p>}
          {errors.file && !fileError && (
            <p className="mt-1.5 text-xs font-semibold text-red-600">{errors.file}</p>
          )}
        </div>

        {/* Message / Cover Note */}
        <label className="block">
          <span className="block text-sm font-bold text-ink mb-1.5">
            Cover Note / Summary <span className="text-xs font-normal text-slate-500">(optional)</span>
          </span>
          <textarea
            name="message"
            rows={4}
            placeholder="Tell us a little about yourself, your areas of interest, or relevant projects..."
            className="mt-1 w-full resize-none rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-ink placeholder:font-normal placeholder:text-slate-400 outline-none transition focus:border-indigo focus:ring-1 focus:ring-indigo"
          />
        </label>

        {/* Submit Actions */}
        <div className="flex flex-wrap items-center gap-4 pt-2">
          <button
            type="submit"
            disabled={status === "loading"}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo px-8 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:scale-[1.01] hover:bg-indigo-light active:scale-[0.99] disabled:opacity-60 disabled:hover:scale-100"
          >
            {status === "loading" ? (
              <>
                <svg className="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span>Submitting Application…</span>
              </>
            ) : (
              <>
                <span>Submit Application & Resume</span>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M4 12L12 4M12 4H5M12 4V11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </>
            )}
          </button>

          {status === "error" && Object.keys(errors).length > 0 && (
            <span className="text-xs text-red-600">Please correct the highlighted fields above.</span>
          )}

          {status === "error" && serverError && (
            <span className="text-xs text-red-600">{serverError}</span>
          )}
        </div>
      </form>
    </div>
  );
}
