import styles from "../index.module.css";
import type { ToggleProperties } from "@sharadox/consent-web-library/consent-panel/toggle/type";

/** One cookie category with its on/off switch. */
export function Toggle({ title, text, checked, locked, lockedLabel, onChange }: ToggleProperties) {
  return (
    <label className={styles.category}>
      <span className={styles.categoryCopy}>
        <b>{title}</b>
        <span>{text}</span>
      </span>
      {locked && <span className={styles.always}>{lockedLabel}</span>}
      <input
        type="checkbox"
        role="switch"
        checked={checked}
        disabled={locked}
        onChange={(event) => onChange(event.target.checked)}
        className={styles.switch}
      />
    </label>
  );
}
