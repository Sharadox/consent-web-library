import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MotionGlobalConfig } from "motion/react";
import { afterEach, describe, expect, test } from "vitest";
import { openConsent, saveConsent } from "@sharadox/consent-web-library/consent";
import { ConsentPanel } from "@sharadox/consent-web-library/consent-panel";
import type { ConsentConfiguration } from "@sharadox/consent-web-library/consent/type";

const CONFIGURATION: ConsentConfiguration = {
  storageKey: "consent",
  version: 1,
  categories: [{ key: "required", required: true }, { key: "analytics" }, { key: "unnamed" }],
};
const COPY = {
  title: "Cookies",
  text: "We use cookies.",
  acceptAll: "Accept All",
  deny: "Deny",
  customize: "Customize",
  save: "Save Choices",
  back: "Back",
  close: "Close",
  alwaysOn: "Always on",
  categories: { required: { title: "Required", text: "Needed." }, analytics: { title: "Analytics", text: "Visits." } },
};
// Animations finish at once, so unmounting never cancels one mid-way.
MotionGlobalConfig.skipAnimations = true;

const panel = () => screen.queryByRole("dialog", { name: "Cookies" });
const button = (name: string) => fireEvent.click(screen.getByRole("button", { name }));
const stored = () =>
  JSON.parse(localStorage.getItem("consent") ?? "null") as { granted: Record<string, boolean> } | null;

afterEach(() => {
  cleanup();
  localStorage.clear();
  sessionStorage.clear();
});

describe("ConsentPanel", () => {
  test("shows the summary while there is no answer, and Accept All stores everything", async () => {
    render(
      <ConsentPanel
        configuration={CONFIGURATION}
        copy={COPY}
        className="panel"
        icon={<i>icon</i>}
        decoration={<b>mark</b>}
      />,
    );
    expect(panel()!.className).toContain("panel");
    expect(screen.getByText("We use cookies.")).toBeTruthy();
    expect(screen.getByText("icon")).toBeTruthy();
    await act(async () => button("Accept All"));
    expect(stored()!.granted).toEqual({ required: true, analytics: true, unnamed: true });
  });

  test("Deny keeps nothing for good", async () => {
    render(<ConsentPanel configuration={CONFIGURATION} copy={COPY} />);
    await act(async () => button("Deny"));
    expect(stored()).toBeNull();
    expect(sessionStorage.getItem("consent-declined")).toBe("1");
  });

  test("Customize shows switches (required locked on), Back returns, Save stores the selection", async () => {
    render(<ConsentPanel configuration={CONFIGURATION} copy={COPY} />);
    button("Customize");
    const required = screen.getByRole("switch", { name: /Required/ }) as HTMLInputElement;
    expect(required.checked).toBe(true);
    expect(required.disabled).toBe(true);
    expect(screen.getByText("Always on")).toBeTruthy();
    expect(screen.getByRole("switch", { name: /unnamed/ })).toBeTruthy();
    button("Back");
    expect(screen.getByText("We use cookies.")).toBeTruthy();
    button("Customize");
    fireEvent.click(screen.getByRole("switch", { name: /Analytics/ }));
    await act(async () => button("Save Choices"));
    expect(stored()!.granted).toEqual({ required: true, analytics: true, unnamed: false });
  });

  test("reopens on the manual selection with the stored answer, and Close leaves it unchanged", async () => {
    saveConsent(CONFIGURATION, { analytics: true });
    render(<ConsentPanel configuration={CONFIGURATION} copy={COPY} />);
    expect(panel()).toBeNull();
    await act(async () => openConsent());
    expect((screen.getByRole("switch", { name: /Analytics/ }) as HTMLInputElement).checked).toBe(true);
    await act(async () => button("Close"));
    expect(stored()!.granted.analytics).toBe(true);
  });

  test("reopened without an answer, it starts from the required categories", async () => {
    sessionStorage.setItem("consent-declined", "1");
    render(<ConsentPanel configuration={CONFIGURATION} copy={COPY} />);
    expect(panel()).toBeNull();
    await act(async () => openConsent());
    expect((screen.getByRole("switch", { name: /Analytics/ }) as HTMLInputElement).checked).toBe(false);
  });
  test("with only required categories it has one button, kept for good, and the details", async () => {
    const configuration: ConsentConfiguration = {
      storageKey: "consent",
      version: 1,
      categories: [{ key: "required", required: true }],
    };
    render(
      <ConsentPanel configuration={configuration} copy={{ ...COPY, acknowledge: "Got It", details: "Details" }} />,
    );
    expect(await screen.findByRole("button", { name: "Got It" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Deny" })).toBeNull();
    button("Details");
    expect(screen.getByText("Needed.")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Save Choices" })).toBeNull();
    button("Got It");
    expect(stored()?.granted).toEqual({ required: true });
  });

  test("with only required categories and no extra copy it falls back to Accept All and Customize", async () => {
    const configuration: ConsentConfiguration = {
      storageKey: "consent",
      version: 1,
      categories: [{ key: "required", required: true }],
    };
    render(<ConsentPanel configuration={configuration} copy={COPY} />);
    expect(await screen.findByRole("button", { name: "Accept All" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Customize" })).toBeTruthy();
  });
});
