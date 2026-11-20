import type { ConsentPanelProperties } from "@sharadox/consent-web-library/consent-panel/type";
import type { ConsentContent, ConsentLabel, Translated } from "@sharadox/consent-web-library/consent-copy/type";

/** The labels every Sharadox consent panel shares, in English and Portuguese. Other languages give their own. */
export const CONSENT_LABELS: Readonly<Record<ConsentLabel, Translated>> = {
  acceptAll: { en: "Accept All", pt: "Aceitar Todos" },
  acknowledge: { en: "Got It", pt: "Entendido" },
  details: { en: "Details", pt: "Detalhes" },
  deny: { en: "Deny", pt: "Recusar" },
  customize: { en: "Customize", pt: "Personalizar" },
  save: { en: "Save Choices", pt: "Guardar Escolhas" },
  back: { en: "Back", pt: "Voltar" },
  close: { en: "Close", pt: "Fechar" },
  alwaysOn: { en: "Always on", pt: "Sempre ativos" },
  preferences: { en: "Cookie Preferences", pt: "Preferências de Cookies" },
};

/**
 * A label in the visitor's language: the site's own when it gives one, otherwise the shared default (English when
 * the default has no such language).
 *
 * @example
 * consentLabel("preferences", "pt"); // "Preferências de Cookies"
 */
export function consentLabel(label: ConsentLabel, locale: string, content?: Pick<ConsentContent, "labels">): string {
  const text = content?.labels?.[label] ?? CONSENT_LABELS[label];
  return text[locale] ?? CONSENT_LABELS[label][locale] ?? CONSENT_LABELS[label].en!;
}

/**
 * The consent panel's copy in one language, from what the site writes (title, text, categories) and the shared
 * labels.
 *
 * @example
 * <ConsentPanel configuration={CONFIGURATION} copy={consentCopy(CONSENT, locale)} />
 */
export function consentCopy(content: ConsentContent, locale: string): ConsentPanelProperties["copy"] {
  const label = (name: ConsentLabel) => consentLabel(name, locale, content);
  return {
    title: content.title[locale]!,
    text: content.text[locale]!,
    acceptAll: label("acceptAll"),
    acknowledge: label("acknowledge"),
    details: label("details"),
    deny: label("deny"),
    customize: label("customize"),
    save: label("save"),
    back: label("back"),
    close: label("close"),
    alwaysOn: label("alwaysOn"),
    categories: Object.fromEntries(
      Object.entries(content.categories).map(([key, category]) => [
        key,
        { title: category.title[locale]!, text: category.text[locale]! },
      ]),
    ),
  };
}
