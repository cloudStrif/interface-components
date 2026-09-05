/**
 * Standard adapted option model used internally by SafranDropdownComponent.
 */
export interface SafranDropdownOption<T = unknown> {
  id: string | number;
  label: string;
  subLabel?: string;
  badge?: string;
  badgeColor?: 'blue' | 'cyan' | 'green' | 'amber' | 'purple' | 'red';
  icon?: string;
  disabled?: boolean;
  raw: T;
}

/**
 * Adapter function signature to map a custom API object of type T to a SafranDropdownOption.
 */
export type SafranDropdownAdapter<T> = (item: T) => SafranDropdownOption<T>;

/**
 * Event payload emitted when an action button inside a dropdown item is clicked.
 */
export interface SafranDropdownActionEvent<T = unknown> {
  action: string;
  option: SafranDropdownOption<T>;
  event: MouseEvent;
}
