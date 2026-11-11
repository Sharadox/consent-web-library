import type { ConsentStatus } from "@sharadox/consent-web-library/consent/type";

export interface ConsentState {
  /** `undefined` on the server and before hydration, so nothing flashes for visitors who already answered. */
  status: ConsentStatus | undefined;
  acceptAll: () => void;
  deny: () => void;
  /** Stores a manual selection. */
  save: (granted: Record<string, boolean>) => void;
}
