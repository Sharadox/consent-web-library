import { expect, test } from "vitest";
import { CONSENT_LABELS, consentCopy, consentLabel } from "@sharadox/consent-web-library/consent-copy";

const content = {
  title: { en: "Cookies", pt: "Cookies", fr: "Cookies" },
  text: { en: "Only what the site needs.", pt: "Só o que o site precisa.", fr: "Le nécessaire." },
  categories: {
    required: {
      title: { en: "Required", pt: "Necessários", fr: "Requis" },
      text: { en: "Language.", pt: "Idioma.", fr: "Langue." },
    },
  },
  labels: { save: { en: "Keep", pt: "Guardar" } },
};

test("builds the panel's copy in the visitor's language from the site's text and the shared labels", () => {
  expect(consentCopy(content, "pt")).toEqual({
    title: "Cookies",
    text: "Só o que o site precisa.",
    acceptAll: "Aceitar Todos",
    acknowledge: "Entendido",
    details: "Detalhes",
    deny: "Recusar",
    customize: "Personalizar",
    save: "Guardar",
    back: "Voltar",
    close: "Fechar",
    alwaysOn: "Sempre ativos",
    categories: { required: { title: "Necessários", text: "Idioma." } },
  });
});

test("falls back to the shared label, then to English, for languages the labels don't have", () => {
  expect(consentCopy(content, "fr").acceptAll).toBe("Accept All");
  expect(consentCopy(content, "fr").save).toBe("Save Choices");
  expect(consentLabel("preferences", "pt")).toBe("Preferências de Cookies");
  expect(consentLabel("preferences", "fr")).toBe(CONSENT_LABELS.preferences.en);
});
