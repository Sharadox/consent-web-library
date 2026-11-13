"use client";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { classNames } from "@sharadox/web-library/class-name";
import { CONSENT_OPEN_EVENT, requiredOnly } from "@sharadox/consent-web-library/consent";
import { Toggle } from "@sharadox/consent-web-library/consent-panel/toggle";
import { useConsent } from "@sharadox/consent-web-library/use-consent";
import styles from "./index.module.css";
import type { ConsentPanelProperties } from "@sharadox/consent-web-library/consent-panel/type";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * The cookie panel. It shows while there is no stored answer: Accept All and Save Choices are kept for good, Deny
 * only for this visit (the visitor is asked again next time), and `openConsent()` reopens it on the manual
 * selection. When every category is required there is nothing to choose: the panel only tells, with one button
 * (`acknowledge`, kept for good) and the details (`details`) showing what each category is for. Styled with CSS variables (`--consent-background`, `--consent-foreground`, `--consent-muted`,
 * `--consent-line`, `--consent-radius`, `--consent-font`), placed by `className`.
 *
 * @example
 * <ConsentPanel configuration={CONSENT} copy={COPY[locale]} className={styles.panel} />
 */
export function ConsentPanel({ configuration, copy, className, icon, decoration }: ConsentPanelProperties) {
  const { status, acceptAll, deny, save } = useConsent(configuration);
  const [reopened, setReopened] = useState(false);
  const [manual, setManual] = useState(false);
  const [granted, setGranted] = useState<Record<string, boolean>>(() => requiredOnly(configuration));
  const onlyRequired = configuration.categories.every((category) => category.required === true);

  useEffect(() => {
    const open = () => {
      setGranted({ ...(status?.kind === "decided" ? status.record.granted : requiredOnly(configuration)) });
      setManual(true);
      setReopened(true);
    };
    addEventListener(CONSENT_OPEN_EVENT, open);
    return () => removeEventListener(CONSENT_OPEN_EVENT, open);
  }, [status, configuration]);

  const close = (action: () => void) => () => {
    action();
    setReopened(false);
    setManual(false);
  };
  const secondary = () => {
    if (!manual) setManual(true);
    else if (reopened) close(() => {})();
    else setManual(false);
  };

  return (
    <AnimatePresence>
      {(reopened || status?.kind === "unknown") && (
        <motion.section
          key="consent"
          className={classNames(styles.consent, className)}
          role="dialog"
          aria-labelledby="consent-title"
          initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: 20, filter: "blur(6px)" }}
          transition={{ duration: 0.7, delay: reopened ? 0 : 0.8, ease: EASE }}
        >
          {decoration}
          <div className={styles.header}>
            {icon}
            <h2 id="consent-title">{copy.title}</h2>
          </div>
          {manual ? (
            <div className={styles.categories}>
              {configuration.categories.map((category) => (
                <Toggle
                  key={category.key}
                  title={copy.categories[category.key]?.title ?? category.key}
                  text={copy.categories[category.key]?.text ?? ""}
                  checked={category.required === true || granted[category.key] === true}
                  locked={category.required === true}
                  lockedLabel={copy.alwaysOn}
                  onChange={(checked) => setGranted((current) => ({ ...current, [category.key]: checked }))}
                />
              ))}
            </div>
          ) : (
            <p className={styles.text}>{copy.text}</p>
          )}
          <div className={styles.actions}>
            <button type="button" className={styles.primary} onClick={close(acceptAll)}>
              {onlyRequired ? (copy.acknowledge ?? copy.acceptAll) : copy.acceptAll}
            </button>
            {onlyRequired ? null : manual ? (
              <button type="button" onClick={close(() => save(granted))}>
                {copy.save}
              </button>
            ) : (
              <button type="button" onClick={close(deny)}>
                {copy.deny}
              </button>
            )}
            <button type="button" className={styles.quiet} onClick={secondary}>
              {manual
                ? reopened
                  ? copy.close
                  : copy.back
                : onlyRequired
                  ? (copy.details ?? copy.customize)
                  : copy.customize}
            </button>
          </div>
        </motion.section>
      )}
    </AnimatePresence>
  );
}
