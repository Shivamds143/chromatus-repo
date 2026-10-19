"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface CookieCategory {
  key: string;
  name: string;
  description: string;
  required: boolean;
  enabled: boolean;
}

interface CookieSettings {
  bannerEnabled: boolean;
  bannerTitle: string;
  bannerMessage: string;
  acceptAllLabel: string;
  rejectAllLabel: string;
  settingsLabel: string;
  savePreferencesLabel: string;
  policyLinkLabel: string;
  policyLinkUrl: string;
  categories: CookieCategory[];
  scripts: {
    analytics?: string;
    functional?: string;
    marketing?: string;
  };
}

const STORAGE_KEY = "chromatus_cookie_consent";

function executeScripts(scripts: CookieSettings["scripts"], consent: Record<string, boolean>) {
  if (typeof document === "undefined" || !scripts) return;

  const runSnippet = (id: string, snippet?: string) => {
    if (!snippet || !snippet.trim()) return;
    if (document.getElementById(`cookie-script-${id}`)) return; // already injected

    try {
      const container = document.createElement("div");
      container.id = `cookie-script-${id}`;
      container.innerHTML = snippet;
      const scriptElements = Array.from(container.querySelectorAll("script"));
      if (scriptElements.length > 0) {
        scriptElements.forEach((s) => {
          const newScript = document.createElement("script");
          Array.from(s.attributes).forEach((attr) => newScript.setAttribute(attr.name, attr.value));
          newScript.textContent = s.textContent;
          document.head.appendChild(newScript);
        });
      } else {
        document.head.appendChild(container);
      }
    } catch (e) {
      console.error(`[CookieConsent] Error executing script for ${id}:`, e);
    }
  };

  if (consent.analytics && scripts.analytics) runSnippet("analytics", scripts.analytics);
  if (consent.functional && scripts.functional) runSnippet("functional", scripts.functional);
  if (consent.marketing && scripts.marketing) runSnippet("marketing", scripts.marketing);
}

export default function CookieConsentBanner() {
  const [settings, setSettings] = useState<CookieSettings | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [preferences, setPreferences] = useState<Record<string, boolean>>({
    necessary: true,
    analytics: false,
    functional: false,
    marketing: false,
  });

  useEffect(() => {
    let cancelled = false;
    fetch("/api/cookie-settings")
      .then((res) => res.json())
      .then((data) => {
        if (cancelled || !data?.settings) return;
        const set: CookieSettings = data.settings;
        setSettings(set);

        // Check existing consent
        let existingConsent: any = null;
        try {
          const raw = localStorage.getItem(STORAGE_KEY);
          if (raw) existingConsent = JSON.parse(raw);
        } catch {}

        if (existingConsent && typeof existingConsent === "object") {
          setPreferences({
            necessary: true,
            analytics: !!existingConsent.analytics,
            functional: !!existingConsent.functional,
            marketing: !!existingConsent.marketing,
          });
          executeScripts(set.scripts, existingConsent);
        } else if (set.bannerEnabled) {
          setShowBanner(true);
        }
      })
      .catch(() => {});

    const handleOpenSettings = () => {
      setShowModal(true);
      setShowBanner(false);
    };
    window.addEventListener("open-cookie-settings", handleOpenSettings);

    return () => {
      cancelled = true;
      window.removeEventListener("open-cookie-settings", handleOpenSettings);
    };
  }, []);

  function saveConsent(consentMap: Record<string, boolean>) {
    const categoriesConsent: Record<string, boolean> = {
      necessary: true,
      analytics: !!consentMap.analytics,
      functional: !!consentMap.functional,
      marketing: !!consentMap.marketing,
    };
    const storagePayload = {
      ...categoriesConsent,
      timestamp: new Date().toISOString(),
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(storagePayload));
      document.cookie = `${STORAGE_KEY}=${encodeURIComponent(JSON.stringify(storagePayload))}; path=/; max-age=31536000; SameSite=Lax`;
    } catch {}

    setPreferences(categoriesConsent);
    if (settings?.scripts) {
      executeScripts(settings.scripts, categoriesConsent);
    }
    setShowBanner(false);
    setShowModal(false);
  }

  function handleAcceptAll() {
    saveConsent({ necessary: true, analytics: true, functional: true, marketing: true });
  }

  function handleRejectAll() {
    saveConsent({ necessary: true, analytics: false, functional: false, marketing: false });
  }

  function handleSavePreferences() {
    saveConsent(preferences);
  }

  if (!settings || !settings.bannerEnabled) return null;

  return (
    <>
      {/* Bottom Sticky Banner */}
      {showBanner && !showModal && (
        <aside
          role="dialog"
          aria-label="Cookie consent banner"
          className="fixed bottom-0 inset-x-0 z-50 p-4 sm:p-6 bg-ink/95 backdrop-blur border-t border-paper/15 shadow-2xl text-paper animate-in fade-in slide-in-from-bottom duration-300"
        >
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            <div className="max-w-3xl space-y-1.5">
              <h3 className="font-display text-base font-semibold text-white tracking-wide">
                {settings.bannerTitle || "We value your privacy"}
              </h3>
              <p className="text-xs sm:text-sm text-paper/75 leading-relaxed">
                {settings.bannerMessage}
                {settings.policyLinkUrl && (
                  <Link
                    href={settings.policyLinkUrl}
                    className="ml-1.5 underline underline-offset-2 text-signal hover:text-signal/90 font-medium"
                  >
                    {settings.policyLinkLabel || "Cookie Policy"}
                  </Link>
                )}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2.5 shrink-0 w-full md:w-auto">
              <button
                type="button"
                onClick={handleRejectAll}
                className="flex-1 md:flex-none px-4 py-2 text-xs sm:text-sm font-semibold text-paper/80 bg-paper/10 hover:bg-paper/20 rounded-md transition"
              >
                {settings.rejectAllLabel || "Reject All"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowModal(true);
                  setShowBanner(false);
                }}
                className="flex-1 md:flex-none px-4 py-2 text-xs sm:text-sm font-semibold text-paper/90 border border-paper/25 hover:border-paper/50 rounded-md transition"
              >
                {settings.settingsLabel || "Cookie Settings"}
              </button>
              <button
                type="button"
                onClick={handleAcceptAll}
                className="flex-1 md:flex-none px-5 py-2 text-xs sm:text-sm font-semibold text-ink bg-signal hover:bg-signal/90 rounded-md shadow-sm transition"
              >
                {settings.acceptAllLabel || "Accept All Cookies"}
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* Preferences Center Modal */}
      {showModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/70 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="font-display text-lg font-bold text-navy">
                  {settings.settingsLabel || "Cookie Preferences"}
                </h2>
                <p className="text-xs text-inkgray mt-0.5">
                  Customize the types of cookies you permit us to use.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition"
                aria-label="Close"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <div className="px-6 py-4 overflow-y-auto space-y-4 divide-y divide-gray-100">
              {(settings.categories || []).map((cat) => {
                const isNecessary = cat.key === "necessary";
                const isChecked = isNecessary ? true : !!preferences[cat.key];

                return (
                  <div key={cat.key} className="pt-4 first:pt-0 flex items-start justify-between gap-4">
                    <div className="space-y-1 pr-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-navy">{cat.name}</span>
                        {isNecessary && (
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-50 text-brandblue">
                            Always Active
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-inkgray leading-relaxed">{cat.description}</p>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                      <input
                        type="checkbox"
                        disabled={isNecessary}
                        checked={isChecked}
                        onChange={(e) => {
                          if (isNecessary) return;
                          setPreferences((prev) => ({ ...prev, [cat.key]: e.target.checked }));
                        }}
                        className="sr-only peer"
                      />
                      <div
                        className={`w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${
                          isNecessary
                            ? "bg-brandblue/70 cursor-not-allowed"
                            : "peer-checked:bg-brandblue"
                        }`}
                      />
                    </label>
                  </div>
                );
              })}
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleRejectAll}
                className="text-xs font-semibold text-inkgray hover:text-navy underline underline-offset-2"
              >
                {settings.rejectAllLabel || "Reject All"}
              </button>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleAcceptAll}
                  className="px-4 py-2 text-xs sm:text-sm font-semibold text-navy bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition"
                >
                  {settings.acceptAllLabel || "Accept All"}
                </button>
                <button
                  type="button"
                  onClick={handleSavePreferences}
                  className="px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-brandorange hover:bg-brandorange-dark rounded-lg shadow-sm transition"
                >
                  {settings.savePreferencesLabel || "Save Preferences"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
