import type { ReactNode } from "react";
import type { ConsentConfiguration } from "@sharadox/consent-web-library/consent/type";

/** Every text the panel shows, in the visitor's language. */
export interface ConsentCopy {
  title: string;
  /** The summary shown first. */
  text: string;
  acceptAll: string;
  deny: string;
  customize: string;
  save: string;
  /** Back from the manual selection to the summary. */
  back: string;
  /** Close the panel when it was reopened from a "cookie preferences" link. */
  close: string;
  /** The one button when every category is required ("Got It"); Accept All's text if not given. */
  acknowledge?: string;
  /** Opens the categories when every category is required ("Details"); Customize's text if not given. */
  details?: string;
  /** Label next to required categories' switches. */
  alwaysOn: string;
  /** Title and explanation of each category, by key. */
  categories: Readonly<Record<string, { title: string; text: string }>>;
}

export interface ConsentPanelProperties {
  configuration: ConsentConfiguration;
  copy: ConsentCopy;
  /** Extra class for the panel, to place and style it. */
  className?: string;
  /** Shown before the title (a small cookie icon, for example). */
  icon?: ReactNode;
  /** Extra decoration inside the panel (corner marks, glows…). */
  decoration?: ReactNode;
}
