/**
 * Standard adapted option model used internally by SbdDropdownComponent.
 */
export interface SbdDropdownOption<T = unknown> {
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
 * Adapter function signature to map a custom API object of type T to a SbdDropdownOption.
 */
export type SbdDropdownAdapter<T> = (item: T) => SbdDropdownOption<T>;

/**
 * Event payload emitted when an action button inside a dropdown item is clicked.
 */
export interface SbdDropdownActionEvent<T = unknown> {
  action: string;
  option: SbdDropdownOption<T>;
  event: MouseEvent;
}
