import { afterEach, expect, test, vi } from "vitest";
import {
  declineConsent,
  everything,
  hasConsent,
  readConsent,
  saveConsent,
} from "@sharadox/consent-web-library/consent";
import type { ConsentConfiguration } from "@sharadox/consent-web-library/consent/type";

const CONFIGURATION: ConsentConfiguration = {
  storageKey: "consent",
  version: 1,
  categories: [{ key: "required", required: true }, { key: "analytics" }, { key: "marketing" }],
};

afterEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});

test("asks when nothing is stored", () => {
  expect(readConsent(CONFIGURATION)).toEqual({ kind: "unknown" });
  expect(hasConsent(CONFIGURATION, "required")).toBe(true);
  expect(hasConsent(CONFIGURATION, "analytics")).toBe(false);
});

test("keeps accepted and manual answers for good, with required always on", () => {
  saveConsent(CONFIGURATION, { required: false, analytics: true, marketing: false });
  const status = readConsent(CONFIGURATION);
  expect(status.kind === "decided" && status.record.granted).toEqual({
    required: true,
    analytics: true,
    marketing: false,
  });
  expect(hasConsent(CONFIGURATION, "analytics")).toBe(true);
  saveConsent(CONFIGURATION, everything(CONFIGURATION));
  expect(hasConsent(CONFIGURATION, "marketing")).toBe(true);
});

test("keeps a refusal only for this visit, and asks again on the next one", () => {
  saveConsent(CONFIGURATION, everything(CONFIGURATION));
  declineConsent(CONFIGURATION);
  expect(readConsent(CONFIGURATION)).toEqual({ kind: "declined" });
  expect(localStorage.getItem("consent")).toBeNull();
  sessionStorage.clear(); // the visit ends
  expect(readConsent(CONFIGURATION)).toEqual({ kind: "unknown" });
});

test("asks again when the categories change", () => {
  saveConsent(CONFIGURATION, everything(CONFIGURATION));
  expect(readConsent({ ...CONFIGURATION, version: 2 })).toEqual({ kind: "unknown" });
});

test("requiredOnly and everything list every category", async () => {
  const { requiredOnly } = await import("@sharadox/consent-web-library/consent");
  expect(requiredOnly(CONFIGURATION)).toEqual({ required: true, analytics: false, marketing: false });
  expect(everything(CONFIGURATION)).toEqual({ required: true, analytics: true, marketing: true });
});

test("openConsent asks the panel to open", async () => {
  const { openConsent, CONSENT_OPEN_EVENT } = await import("@sharadox/consent-web-library/consent");
  const listener = vi.fn();
  addEventListener(CONSENT_OPEN_EVENT, listener);
  openConsent();
  expect(listener).toHaveBeenCalledOnce();
  removeEventListener(CONSENT_OPEN_EVENT, listener);
});

test("blocked or broken storage means asking again", () => {
  localStorage.setItem("consent", "{not json");
  expect(readConsent(CONFIGURATION)).toEqual({ kind: "unknown" });
  const blocked = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
    throw new Error("blocked");
  });
  expect(() => saveConsent(CONFIGURATION, everything(CONFIGURATION))).not.toThrow();
  expect(() => declineConsent(CONFIGURATION)).not.toThrow();
  blocked.mockRestore();
});
