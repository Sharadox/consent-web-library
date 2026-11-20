/** Text in each of a site's languages: `{ en: "Cookies", pt: "Cookies" }`. */
export type Translated = Readonly<Record<string, string>>;

/** The labels every consent panel shares (buttons, and the footer link that reopens it). */
export type ConsentLabel =
  | "acceptAll"
  | "acknowledge"
  | "details"
  | "deny"
  | "customize"
  | "save"
  | "back"
  | "close"
  | "alwaysOn"
  | "preferences";

/** What a site writes for its panel: its title, its text and its categories; any label overrides the default. */
export interface ConsentContent {
  title: Translated;
  text: Translated;
  categories: Readonly<Record<string, { title: Translated; text: Translated }>>;
  labels?: Partial<Record<ConsentLabel, Translated>>;
}
