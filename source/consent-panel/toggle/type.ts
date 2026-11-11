export interface ToggleProperties {
  title: string;
  text: string;
  checked: boolean;
  /** Required categories show as on and can't be switched off. */
  locked: boolean;
  lockedLabel: string;
  onChange: (checked: boolean) => void;
}
