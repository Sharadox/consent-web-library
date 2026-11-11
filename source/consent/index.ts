import type { ConsentConfiguration, ConsentRecord, ConsentStatus } from "@sharadox/consent-web-library/consent/type";

/** Window event fired whenever the answer changes, and the one that reopens the consent panel. */
export const CONSENT_CHANGE_EVENT = "consent-change";
export const CONSENT_OPEN_EVENT = "consent-open";

const declinedKey = (configuration: ConsentConfiguration) => `${configuration.storageKey}-declined`;

/** Only the required categories: what "Deny" grants. */
export function requiredOnly(configuration: ConsentConfiguration): Record<string, boolean> {
  return Object.fromEntries(configuration.categories.map((category) => [category.key, !!category.required]));
}

/** Every category: what "Accept All" grants. */
export function everything(configuration: ConsentConfiguration): Record<string, boolean> {
  return Object.fromEntries(configuration.categories.map((category) => [category.key, true]));
}

/** Reads the visitor's answer. A stored answer from an older version counts as not asked. */
export function readConsent(configuration: ConsentConfiguration): ConsentStatus {
  try {
    const stored = localStorage.getItem(configuration.storageKey);
    if (stored) {
      const record = JSON.parse(stored) as ConsentRecord;
      if (record.version === configuration.version) return { kind: "decided", record };
    }
    if (sessionStorage.getItem(declinedKey(configuration))) return { kind: "declined" };
  } catch {
    // Unreadable or blocked storage: ask.
  }
  return { kind: "unknown" };
}

/** True when the visitor allowed a category (required categories always are). */
export function hasConsent(configuration: ConsentConfiguration, key: string): boolean {
  if (configuration.categories.some((category) => category.key === key && category.required)) return true;
  const status = readConsent(configuration);
  return status.kind === "decided" && !!status.record.granted[key];
}

const announce = () => window.dispatchEvent(new Event(CONSENT_CHANGE_EVENT));

/** Stores an answer ("Accept All" or a manual selection) for good. Required categories are forced on. */
export function saveConsent(configuration: ConsentConfiguration, granted: Record<string, boolean>): void {
  const record: ConsentRecord = {
    version: configuration.version,
    granted: {
      ...granted,
      ...Object.fromEntries(
        configuration.categories.filter((category) => category.required).map((category) => [category.key, true]),
      ),
    },
    date: new Date().toISOString(),
  };
  try {
    localStorage.setItem(configuration.storageKey, JSON.stringify(record));
    sessionStorage.removeItem(declinedKey(configuration));
  } catch {
    // Storage blocked: nothing persists, the panel asks again next time.
  }
  announce();
}

/**
 * "Deny": only required categories, and nothing kept for good — the answer lasts for this visit, and the visitor
 * is asked again next time they come.
 */
export function declineConsent(configuration: ConsentConfiguration): void {
  try {
    localStorage.removeItem(configuration.storageKey);
    sessionStorage.setItem(declinedKey(configuration), "1");
  } catch {
    // Storage blocked: the panel simply shows again.
  }
  announce();
}

/** Reopens the consent panel, for example from a "Cookie Preferences" link. */
export function openConsent(): void {
  window.dispatchEvent(new Event(CONSENT_OPEN_EVENT));
}
