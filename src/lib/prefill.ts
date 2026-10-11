// Recipient details carried from "order again" to the checkout form.
export type RecipientPrefill = {
  recipientName: string;
  recipientPhone: string;
  city: string;
  street: string;
  houseNumber: string;
};

const KEY = "checkoutPrefill";

// Orders store "street house-number" in one field; split off a trailing number.
export function splitStreet(full: string) {
  const m = full.trim().match(/^(.*\S)\s+(\S*\d\S*)$/);
  return m ? { street: m[1]!, houseNumber: m[2]! } : { street: full.trim(), houseNumber: "" };
}

export function savePrefill(p: RecipientPrefill) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    /* ignore */
  }
}

export function readPrefill(): RecipientPrefill | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as RecipientPrefill) : null;
  } catch {
    return null;
  }
}

export function clearPrefill() {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

// Fills empty fields of a form by input name.
export function fillEmpty(form: HTMLFormElement | null, values: Record<string, string>) {
  if (!form) return;
  for (const [name, value] of Object.entries(values)) {
    const el = form.elements.namedItem(name);
    if (el instanceof HTMLInputElement && !el.value && value) el.value = value;
  }
}
