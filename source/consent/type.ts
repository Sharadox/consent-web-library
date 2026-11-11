/** One kind of cookie or storage the site asks about. */
export interface ConsentCategory {
  key: string;
  /** Always on: the site needs it to work (language, style, form security). */
  required?: boolean;
}

/** What the site asks about and where the answer is kept. */
export interface ConsentConfiguration {
  /** Browser storage key for the answer. */
  storageKey: string;
  /** Raise it when the categories change, so everyone is asked again. */
  version: number;
  categories: readonly ConsentCategory[];
}

/** A stored answer. */
export interface ConsentRecord {
  version: number;
  /** Category key → allowed. Required categories are always true. */
  granted: Record<string, boolean>;
  /** When the visitor answered (ISO 8601). */
  date: string;
}

/**
 * Where the visitor stands: not asked yet (or the answer is out of date), declined during this visit (asked again
 * next visit), or answered.
 */
export type ConsentStatus = { kind: "unknown" } | { kind: "declined" } | { kind: "decided"; record: ConsentRecord };
