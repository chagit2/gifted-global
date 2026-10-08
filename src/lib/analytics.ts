// Google Analytics 4. Loaded only after the visitor accepts cookies (GDPR —
// many customers are in France), and never in the Lovable editor preview.
export const GA_ID = "G-PLQM4T3054";
const CONSENT_KEY = "cookieConsent";

export type Consent = "granted" | "denied";

type GtagWindow = Window & { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void };

export function readConsent(): Consent | null {
  try {
    const v = localStorage.getItem(CONSENT_KEY);
    return v === "granted" || v === "denied" ? v : null;
  } catch {
    return null;
  }
}

export function saveConsent(v: Consent) {
  try {
    localStorage.setItem(CONSENT_KEY, v);
  } catch {
    /* storage unavailable: ask again next visit */
  }
}

const isEditorPreview = () =>
  /(^|\.)id-preview--/.test(location.hostname) || location.hostname === "localhost";

let loaded = false;
export function loadAnalytics() {
  if (loaded || typeof window === "undefined" || isEditorPreview()) return;
  loaded = true;
  const w = window as GtagWindow;
  w.dataLayer = w.dataLayer || [];
  w.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    w.dataLayer!.push(arguments);
  };
  w.gtag("js", new Date());
  w.gtag("config", GA_ID, { anonymize_ip: true });
  const s = document.createElement("script");
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(s);
}
