import { act, renderHook } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, expect, test } from "vitest";
import { useConsent } from "@sharadox/consent-web-library/use-consent";
import type { ConsentConfiguration } from "@sharadox/consent-web-library/consent/type";

const CONFIGURATION: ConsentConfiguration = {
  storageKey: "consent",
  version: 1,
  categories: [{ key: "required", required: true }, { key: "analytics" }],
};
afterEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});

test("starts unknown, and follows accept, deny and manual answers", async () => {
  const { result, unmount } = renderHook(() => useConsent(CONFIGURATION));
  expect(result.current.status).toEqual({ kind: "unknown" });
  await act(async () => result.current.acceptAll());
  expect(result.current.status).toMatchObject({
    kind: "decided",
    record: { granted: { required: true, analytics: true } },
  });
  await act(async () => result.current.deny());
  expect(result.current.status).toEqual({ kind: "declined" });
  await act(async () => result.current.save({ analytics: false }));
  expect(result.current.status).toMatchObject({ record: { granted: { required: true, analytics: false } } });
  await act(async () => window.dispatchEvent(new StorageEvent("storage", { key: "consent" })));
  unmount();
});

test("is undefined on the server, so nothing flashes before hydration", () => {
  function Probe() {
    return <p>{String(useConsent(CONFIGURATION).status)}</p>;
  }
  expect(renderToStaticMarkup(<Probe />)).toBe("<p>undefined</p>");
});
