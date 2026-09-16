import { Observable } from 'rxjs';

// ─── Field Types ───────────────────────────────────────────────────────────────

export type SbdFormFieldType =
  | 'text'
  | 'number'
  | 'email'
  | 'password'
  | 'select'
  | 'multiselect'
  | 'radio'
  | 'textarea'
  | 'checkbox'
  | 'checkbox-group'
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

export type SbdFormGridCols = 'full' | 'half' | 'third' | 'quarter' | 'two-thirds';

// ─── Validation ───────────────────────────────────────────────────────────────

export interface SbdFormFieldValidation {
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

export interface SbdFormFieldOption {
  label: string;
  value: any;
  disabled?: boolean;
  /** Optional small description shown below label in radio groups */
  description?: string;
  /** Optional badge color for visual grouping */
  badgeColor?: 'blue' | 'green' | 'amber' | 'red' | 'slate';
}

// ─── Conditional Display ──────────────────────────────────────────────────────

export interface SbdFormFieldCondition {
  /** The key of the other field to watch */
  watchKey: string;
  /** The value(s) that triggers visibility */
  showWhen: any | any[];
}

// ─── File Config ──────────────────────────────────────────────────────────────

export interface SbdFormFileConfig {
  accept?: string;
  multiple?: boolean;
  maxSizeMb?: number;
}

// ─── Range Config ─────────────────────────────────────────────────────────────

export interface SbdFormRangeConfig {
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}

// ─── Rating Config ────────────────────────────────────────────────────────────

export interface SbdFormRatingConfig {
  /** Maximum number of stars (default: 5) */
  maxStars?: number;
  /** Allow half-star selection (default: false) */
  allowHalf?: boolean;
  /** Labels for each rating value */
  labels?: Record<number, string>;
}

// ─── Autocomplete Config ──────────────────────────────────────────────────────

export interface SbdFormAutocompleteConfig {
  /** Minimum characters before suggestions appear (default: 1) */
  minChars?: number;
  /** Max suggestions to display (default: 10) */
  maxSuggestions?: number;
  /** Allow free-text value not in the list (default: false) */
  allowFreeText?: boolean;
}

// ─── Tag Input Config ─────────────────────────────────────────────────────────

export interface SbdFormTagConfig {
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

export interface SbdFormFieldSchema {
  /** Unique key — maps directly to API payload property */
  key: string;
  /** Display label */
  label: string;
  /** Input type */
  type: SbdFormFieldType;
  /** Input placeholder */
  placeholder?: string;
  /** Default value used when no initialData is provided */
  defaultValue?: any;
  /** Static options (for select, multiselect, radio, autocomplete) */
  options?: SbdFormFieldOption[];
  /** Observable providing async options (for select, multiselect, autocomplete) */
  asyncOptions$?: Observable<SbdFormFieldOption[]>;
  /** Validation constraints */
  validation?: SbdFormFieldValidation;
  /** Grid layout sizing */
  gridCols?: SbdFormGridCols;
  /** Disable the field */
  disabled?: boolean;
  /** Small helper text displayed below the field */
  helpText?: string;
  /** Icon name hint for rendering */
  icon?: string;
  /** Only display this field when condition is met */
  condition?: SbdFormFieldCondition;
  /** File input config */
  fileConfig?: SbdFormFileConfig;
  /** Range slider config */
  rangeConfig?: SbdFormRangeConfig;
  /** Rating stars config */
  ratingConfig?: SbdFormRatingConfig;
  /** Autocomplete config */
  autocompleteConfig?: SbdFormAutocompleteConfig;
  /** Tag input config */
  tagConfig?: SbdFormTagConfig;
  /** Used for divider/heading types */
  content?: string;
  /** Section grouping label */
  section?: string;
}

// ─── Form Events ──────────────────────────────────────────────────────────────

export interface SbdFormSubmitEvent<T = Record<string, any>> {
  mode: 'create' | 'edit';
  recordId: string | number | null;
  value: T;
  rawEvent: Event;
}

export interface SbdFormFieldChangeEvent {
  key: string;
  value: any;
  formValue: Record<string, any>;
}

// ─── Form Config ──────────────────────────────────────────────────────────────

export interface SbdFormConfig {
  title?: string;
  subtitle?: string;
  submitLabel?: string;
  cancelLabel?: string;
  showCancel?: boolean;
  showReset?: boolean;
  readOnly?: boolean;
  layout?: 'stacked' | 'compact';
}
