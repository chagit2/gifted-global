// Google Analytics 4. Loaded only after the visitor accepts cookies (GDPR —
// many customers are in France), and never in the Lovable editor preview.
export const GA_ID = "G-PLQM4T3054";
const CONSENT_KEY = "cookieConsent";

export type Consent = "granted" | "denied";

type GtagWindow = Window & { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void };

// "Accept" is remembered for good; "decline" only for the current visit (this
// browser tab session), so the question comes back on the next visit.
export function readConsent(): Consent | null {
  try {
    if (localStorage.getItem(CONSENT_KEY) === "granted") return "granted";
    if (sessionStorage.getItem(CONSENT_KEY) === "denied") return "denied";
  } catch {
    /* storage unavailable */
  }
  return null;
}

export function saveConsent(v: Consent) {
  try {
    if (v === "granted") localStorage.setItem(CONSENT_KEY, v);
    else {
      sessionStorage.setItem(CONSENT_KEY, v);
      localStorage.removeItem(CONSENT_KEY); // also clears a "denied" saved by an older version
    }
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
