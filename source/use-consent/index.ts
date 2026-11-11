"use client";
import { useCallback, useMemo, useSyncExternalStore } from "react";
import {
  CONSENT_CHANGE_EVENT,
  declineConsent,
  everything,
  readConsent,
  saveConsent,
} from "@sharadox/consent-web-library/consent";
import type { ConsentConfiguration } from "@sharadox/consent-web-library/consent/type";
import type { ConsentState } from "@sharadox/consent-web-library/use-consent/type";

const subscribe = (notify: () => void) => {
  window.addEventListener(CONSENT_CHANGE_EVENT, notify);
  window.addEventListener("storage", notify);
  return () => {
    window.removeEventListener(CONSENT_CHANGE_EVENT, notify);
    window.removeEventListener("storage", notify);
  };
};

/** The visitor's cookie answer, kept in sync across the page and other tabs, with the actions that change it. */
export function useConsent(configuration: ConsentConfiguration): ConsentState {
  // A string snapshot keeps useSyncExternalStore stable; it is parsed again below.
  const snapshot = useSyncExternalStore(
    subscribe,
    () => JSON.stringify(readConsent(configuration)),
    () => undefined,
  );
  const status = useMemo(() => (snapshot ? JSON.parse(snapshot) : undefined), [snapshot]);
  const acceptAll = useCallback(() => saveConsent(configuration, everything(configuration)), [configuration]);
  const deny = useCallback(() => declineConsent(configuration), [configuration]);
  const save = useCallback((granted: Record<string, boolean>) => saveConsent(configuration, granted), [configuration]);
  return { status, acceptAll, deny, save };
}
