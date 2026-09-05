import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  SafranFormFieldSchema,
  SafranFormFieldType,
  SafranFormFieldOption,
  SafranFormFieldValidation,
  SafranFormGridCols,
  SafranFormFileConfig,
  SafranFormRangeConfig,
  SafranFormRatingConfig,
  SafranFormAutocompleteConfig,
  SafranFormTagConfig,
  SafranFormFieldCondition
} from '../models/form.model';

// ─── Field Builder (fluent DSL for a single field) ────────────────────────────

export class SafranFieldBuilder {
  private schema: Partial<SafranFormFieldSchema>;
  private _parent: SafranFormBuilderService;

  constructor(key: string, type: SafranFormFieldType, label: string, parent: SafranFormBuilderService) {
    this.schema = { key, type, label };
    this._parent = parent;
  }

  placeholder(value: string): this {
    this.schema.placeholder = value;
    return this;
  }

  defaultValue(value: any): this {
    this.schema.defaultValue = value;
    return this;
  }

  required(msg?: string): this {
    this.schema.validation = {
      ...this.schema.validation,
      required: true,
      ...(msg ? { customValidatorMsg: msg } : {})
    };
    return this;
  }

  minLength(n: number): this {
    this.schema.validation = { ...this.schema.validation, minLength: n };
    return this;
  }

  maxLength(n: number): this {
    this.schema.validation = { ...this.schema.validation, maxLength: n };
    return this;
  }

  min(n: number): this {
    this.schema.validation = { ...this.schema.validation, min: n };
    return this;
  }

  max(n: number): this {
    this.schema.validation = { ...this.schema.validation, max: n };
    return this;
  }

  pattern(p: string | RegExp, msg?: string): this {
    this.schema.validation = {
      ...this.schema.validation,
      pattern: p,
      ...(msg ? { customValidatorMsg: msg } : {})
    };
    return this;
  }

  email(): this {
    this.schema.validation = { ...this.schema.validation, email: true };
    return this;
  }

  matchField(targetKey: string, msg?: string): this {
    this.schema.validation = {
      ...this.schema.validation,
      matchField: targetKey,
      matchFieldMsg: msg ?? `Ce champ doit correspondre au champ "${targetKey}".`
    };
    return this;
  }

  options(opts: SafranFormFieldOption[]): this {
    this.schema.options = opts;
    return this;
  }

  asyncOptions(obs$: Observable<SafranFormFieldOption[]>): this {
    this.schema.asyncOptions$ = obs$;
    return this;
  }

  helpText(text: string): this {
    this.schema.helpText = text;
    return this;
  }

  disabled(): this {
    this.schema.disabled = true;
    return this;
  }

  icon(name: string): this {
    this.schema.icon = name;
    return this;
  }

  showWhen(watchKey: string, showWhen: any | any[]): this {
    this.schema.condition = { watchKey, showWhen } as SafranFormFieldCondition;
    return this;
  }

  fileConfig(cfg: SafranFormFileConfig): this {
    this.schema.fileConfig = cfg;
    return this;
  }

  rangeConfig(cfg: SafranFormRangeConfig): this {
    this.schema.rangeConfig = cfg;
    return this;
  }

  ratingConfig(cfg: SafranFormRatingConfig): this {
    this.schema.ratingConfig = cfg;
    return this;
  }

  autocompleteConfig(cfg: SafranFormAutocompleteConfig): this {
    this.schema.autocompleteConfig = cfg;
    return this;
  }

  tagConfig(cfg: SafranFormTagConfig): this {
    this.schema.tagConfig = cfg;
    return this;
  }

  section(name: string): this {
    this.schema.section = name;
    return this;
  }

  // ─── Grid Layout Shortcuts ─────────────────────────────────────────────────

  full(): this      { this.schema.gridCols = 'full';       return this; }
  half(): this      { this.schema.gridCols = 'half';       return this; }
  third(): this     { this.schema.gridCols = 'third';      return this; }
  quarter(): this   { this.schema.gridCols = 'quarter';    return this; }
  twoThirds(): this { this.schema.gridCols = 'two-thirds'; return this; }

  grid(cols: SafranFormGridCols): this {
    this.schema.gridCols = cols;
    return this;
  }

  // ─── Finalize: go back to parent builder ──────────────────────────────────

  build(): SafranFormBuilderService {
    this._parent['_pushField'](this.schema as SafranFormFieldSchema);
    return this._parent;
  }
}

// ─── SafranFormBuilderService ─────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class SafranFormBuilderService {
  private _fields: SafranFormFieldSchema[] = [];

  /** @internal used by SafranFieldBuilder */
  private _pushField(field: SafranFormFieldSchema): void {
    this._fields.push(field);
  }

  /** Reset internal accumulator — call before building a new schema */
  reset(): this {
    this._fields = [];
    return this;
  }

  // ─── Structural elements ───────────────────────────────────────────────────

  divider(content?: string): this {
    this._fields.push({ key: `__div_${Date.now()}_${Math.random()}`, type: 'divider', label: '', content });
    return this;
  }

  heading(content: string): this {
    this._fields.push({ key: `__hdg_${Date.now()}_${Math.random()}`, type: 'heading', label: '', content });
    return this;
  }

  // ─── Input field factories ─────────────────────────────────────────────────

  text(key: string, label: string): SafranFieldBuilder {
    return new SafranFieldBuilder(key, 'text', label, this);
  }

  number(key: string, label: string): SafranFieldBuilder {
    return new SafranFieldBuilder(key, 'number', label, this);
  }

  email(key: string, label: string): SafranFieldBuilder {
    return new SafranFieldBuilder(key, 'email', label, this);
  }

  password(key: string, label: string): SafranFieldBuilder {
    return new SafranFieldBuilder(key, 'password', label, this);
  }

  textarea(key: string, label: string): SafranFieldBuilder {
    return new SafranFieldBuilder(key, 'textarea', label, this);
  }

  select(key: string, label: string): SafranFieldBuilder {
    return new SafranFieldBuilder(key, 'select', label, this);
  }

  multiselect(key: string, label: string): SafranFieldBuilder {
    return new SafranFieldBuilder(key, 'multiselect', label, this);
  }

  radio(key: string, label: string): SafranFieldBuilder {
    return new SafranFieldBuilder(key, 'radio', label, this);
  }

  checkbox(key: string, label: string): SafranFieldBuilder {
    return new SafranFieldBuilder(key, 'checkbox', label, this);
  }

  toggle(key: string, label: string): SafranFieldBuilder {
    return new SafranFieldBuilder(key, 'toggle', label, this);
  }

  date(key: string, label: string): SafranFieldBuilder {
    return new SafranFieldBuilder(key, 'date', label, this);
  }

  datetimeLocal(key: string, label: string): SafranFieldBuilder {
    return new SafranFieldBuilder(key, 'datetime-local', label, this);
  }

  range(key: string, label: string): SafranFieldBuilder {
    return new SafranFieldBuilder(key, 'range', label, this);
  }

  file(key: string, label: string): SafranFieldBuilder {
    return new SafranFieldBuilder(key, 'file', label, this);
  }

  color(key: string, label: string): SafranFieldBuilder {
    return new SafranFieldBuilder(key, 'color', label, this);
  }

  rating(key: string, label: string): SafranFieldBuilder {
    return new SafranFieldBuilder(key, 'rating', label, this);
  }

  autocomplete(key: string, label: string): SafranFieldBuilder {
    return new SafranFieldBuilder(key, 'autocomplete', label, this);
  }

  tags(key: string, label: string): SafranFieldBuilder {
    return new SafranFieldBuilder(key, 'tag-input', label, this);
  }

  // ─── Output ───────────────────────────────────────────────────────────────

  /** Returns the accumulated field schemas and resets the builder */
  getFields(): SafranFormFieldSchema[] {
    const result = [...this._fields];
    this._fields = [];
    return result;
  }

  peekFields(): SafranFormFieldSchema[] {
    return [...this._fields];
  }
}
