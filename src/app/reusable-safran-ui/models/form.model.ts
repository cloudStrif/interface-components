import { Observable } from 'rxjs';

// ─── Field Types ───────────────────────────────────────────────────────────────

export type SafranFormFieldType =
  | 'text'
  | 'number'
  | 'email'
  | 'password'
  | 'select'
  | 'multiselect'
  | 'radio'
  | 'textarea'
  | 'checkbox'
  | 'toggle'
  | 'date'
  | 'datetime-local'
  | 'range'
  | 'file'
  | 'color'
  | 'rating'
  | 'autocomplete'
  | 'tag-input'
  | 'divider'
  | 'heading';

// ─── Grid Layout ──────────────────────────────────────────────────────────────

export type SafranFormGridCols = 'full' | 'half' | 'third' | 'quarter' | 'two-thirds';

// ─── Validation ───────────────────────────────────────────────────────────────

export interface SafranFormFieldValidation {
  required?: boolean;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string | RegExp;
  email?: boolean;
  /** Custom error message overriding all defaults */
  customValidatorMsg?: string;
  /** Cross-field: the key of the field this field must match (e.g. confirmPassword → password) */
  matchField?: string;
  /** Custom message for matchField failure */
  matchFieldMsg?: string;
}

// ─── Options ──────────────────────────────────────────────────────────────────

export interface SafranFormFieldOption {
  label: string;
  value: any;
  disabled?: boolean;
  /** Optional small description shown below label in radio groups */
  description?: string;
  /** Optional badge color for visual grouping */
  badgeColor?: 'blue' | 'green' | 'amber' | 'red' | 'slate';
}

// ─── Conditional Display ──────────────────────────────────────────────────────

export interface SafranFormFieldCondition {
  /** The key of the other field to watch */
  watchKey: string;
  /** The value(s) that triggers visibility */
  showWhen: any | any[];
}

// ─── File Config ──────────────────────────────────────────────────────────────

export interface SafranFormFileConfig {
  accept?: string;
  multiple?: boolean;
  maxSizeMb?: number;
}

// ─── Range Config ─────────────────────────────────────────────────────────────

export interface SafranFormRangeConfig {
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}

// ─── Rating Config ────────────────────────────────────────────────────────────

export interface SafranFormRatingConfig {
  /** Maximum number of stars (default: 5) */
  maxStars?: number;
  /** Allow half-star selection (default: false) */
  allowHalf?: boolean;
  /** Labels for each rating value */
  labels?: Record<number, string>;
}

// ─── Autocomplete Config ──────────────────────────────────────────────────────

export interface SafranFormAutocompleteConfig {
  /** Minimum characters before suggestions appear (default: 1) */
  minChars?: number;
  /** Max suggestions to display (default: 10) */
  maxSuggestions?: number;
  /** Allow free-text value not in the list (default: false) */
  allowFreeText?: boolean;
}

// ─── Tag Input Config ─────────────────────────────────────────────────────────

export interface SafranFormTagConfig {
  /** Separator keys that trigger tag creation (default: ['Enter', ',']) */
  separators?: string[];
  /** Max number of tags (default: unlimited) */
  maxTags?: number;
  /** Predefined suggestions to pick from */
  suggestions?: string[];
  /** Regex to validate each tag value */
  tagPattern?: RegExp;
  /** Error message for invalid tag pattern */
  tagPatternMsg?: string;
}

// ─── Main Field Schema ────────────────────────────────────────────────────────

export interface SafranFormFieldSchema {
  /** Unique key — maps directly to API payload property */
  key: string;
  /** Display label */
  label: string;
  /** Input type */
  type: SafranFormFieldType;
  /** Input placeholder */
  placeholder?: string;
  /** Default value used when no initialData is provided */
  defaultValue?: any;
  /** Static options (for select, multiselect, radio, autocomplete) */
  options?: SafranFormFieldOption[];
  /** Observable providing async options (for select, multiselect, autocomplete) */
  asyncOptions$?: Observable<SafranFormFieldOption[]>;
  /** Validation constraints */
  validation?: SafranFormFieldValidation;
  /** Grid layout sizing */
  gridCols?: SafranFormGridCols;
  /** Disable the field */
  disabled?: boolean;
  /** Small helper text displayed below the field */
  helpText?: string;
  /** Icon name hint for rendering */
  icon?: string;
  /** Only display this field when condition is met */
  condition?: SafranFormFieldCondition;
  /** File input config */
  fileConfig?: SafranFormFileConfig;
  /** Range slider config */
  rangeConfig?: SafranFormRangeConfig;
  /** Rating stars config */
  ratingConfig?: SafranFormRatingConfig;
  /** Autocomplete config */
  autocompleteConfig?: SafranFormAutocompleteConfig;
  /** Tag input config */
  tagConfig?: SafranFormTagConfig;
  /** Used for divider/heading types */
  content?: string;
  /** Section grouping label */
  section?: string;
}

// ─── Form Events ──────────────────────────────────────────────────────────────

export interface SafranFormSubmitEvent<T = Record<string, any>> {
  mode: 'create' | 'edit';
  recordId: string | number | null;
  value: T;
  rawEvent: Event;
}

export interface SafranFormFieldChangeEvent {
  key: string;
  value: any;
  formValue: Record<string, any>;
}

// ─── Form Config ──────────────────────────────────────────────────────────────

export interface SafranFormConfig {
  title?: string;
  subtitle?: string;
  submitLabel?: string;
  cancelLabel?: string;
  showCancel?: boolean;
  showReset?: boolean;
  readOnly?: boolean;
  layout?: 'stacked' | 'compact';
}
