# @sharadox/consent-web-library

Cookie consent for websites that respects the visitor's answer:

- **Accept All** and **manual choices** are kept for good.
- **Deny** lasts only for the current visit: the visitor is asked again on the next one.
- **Required** categories are always on.
- **Raising the version** asks everyone again after the categories change.
- **`hasConsent(…, "analytics")`** tells your code whether it may load a tool.
- **`openConsent()`** reopens the panel from a "Cookie Preferences" link.

The panel comes ready made, with Accept All, Deny, Customize, switches and Save Choices. It is animated and styled entirely with CSS variables, and its text comes from props in any language.

## Install

```sh
pnpm add @sharadox/consent-web-library
```

## Use

```ts
export const CONSENT = {
  storageKey: "consent",
  version: 1,
  categories: [{ key: "required", required: true }, { key: "analytics" }],
};
```

```tsx
<ConsentPanel configuration={CONSENT} copy={COPY[locale]} className={styles.panel} icon={<CookieIcon />} />
```

```css
.panel {
  --consent-background: var(--background);
  --consent-foreground: var(--foreground);
  --consent-radius: 4px;
  left: 16px;
}
```

```ts
if (hasConsent(CONSENT, "analytics")) loadAnalytics();
addEventListener(CONSENT_CHANGE_EVENT, () => {
  /* the answer changed */
});
```

## API

| Import            | Export                                                                                                                                                  |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `…/consent`       | `readConsent`, `saveConsent`, `declineConsent`, `hasConsent`, `openConsent`, `requiredOnly`, `everything`, `CONSENT_CHANGE_EVENT`, `CONSENT_OPEN_EVENT` |
| `…/consent/type`  | `ConsentConfiguration`, `ConsentCategory`, `ConsentRecord`, `ConsentStatus`                                                                             |
| `…/use-consent`   | `useConsent(configuration)` → `{ status, acceptAll, deny, save }` (in sync across tabs)                                                                 |
| `…/consent-panel` | `<ConsentPanel configuration copy className? icon? decoration?>`; `ConsentCopy` in `…/consent-panel/type`                                               |

**Panel CSS variables:** `--consent-background`, `--consent-foreground`, `--consent-muted`, `--consent-line`, `--consent-radius`, `--consent-font`.

## Develop

`pnpm verify` runs formatting, lint, type-check, tests with 100% coverage and the build. Branches follow `<feature>.development` → `development` → `index`, and releases are `v<version>` tags on `index`.

## License

Licença Sharadox de Código Aberto, versão 0.1.0. See [português](LICENCA.md) (the binding text) and the [English translation](LICENSE.md).
