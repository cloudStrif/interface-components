import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  inject,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { SbdOptLabelPipe } from '../../pipes/sbd-opt-label.pipe';
import {
  ReactiveFormsModule,
  FormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  ValidatorFn,
  AbstractControl,
  ValidationErrors
} from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import {
  SbdFormFieldSchema,
  SbdFormSubmitEvent,
  SbdFormFieldChangeEvent,
  SbdFormFieldValidation,
  SbdFormConfig,
  SbdFormFieldOption
} from '../../models/form.model';

// ─── Cross-field validator factory ───────────────────────────────────────────

function matchFieldValidator(
  sourceKey: string,
  targetKey: string,
  msg: string
): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const source = group.get(sourceKey)?.value;
    const target = group.get(targetKey)?.value;
    if (!source || !target) return null;
    if (source !== target) {
      group.get(sourceKey)?.setErrors({ matchField: { message: msg } });
      return { matchField: true };
    }
    const errs = { ...(group.get(sourceKey)?.errors ?? {}) };
    delete errs['matchField'];
    group.get(sourceKey)?.setErrors(Object.keys(errs).length ? errs : null);
    return null;
  };
}

@Component({
  selector: 'app-sbd-dynamic-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, SbdOptLabelPipe],
  templateUrl: './sbd-dynamic-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SbdDynamicFormComponent implements OnInit, OnChanges, OnDestroy {
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);
  private destroy$ = new Subject<void>();

  // ─── Required Inputs ────────────────────────────────────────────────────────

  @Input({ required: true }) fields: SbdFormFieldSchema[] = [];

  // ─── Optional Inputs ────────────────────────────────────────────────────────

  @Input() initialData: Record<string, any> | null = null;
  @Input() recordId: string | number | null = null;
  @Input() config: SbdFormConfig = {};

  // ─── Legacy flat inputs (kept for backward compat) ──────────────────────────

  @Input() title?: string;
  @Input() subtitle?: string;
  @Input() submitLabel?: string;
  @Input() cancelLabel?: string;
  @Input() showCancel: boolean = true;
  @Input() showReset: boolean = false;
  @Input() loading: boolean = false;
  @Input() readOnly: boolean = false;

  // ─── Outputs ────────────────────────────────────────────────────────────────

  @Output() formSubmit = new EventEmitter<SbdFormSubmitEvent>();
  @Output() formCancel = new EventEmitter<void>();
  @Output() formReset = new EventEmitter<void>();
  @Output() fieldChange = new EventEmitter<SbdFormFieldChangeEvent>();

  // ─── Internal State ─────────────────────────────────────────────────────────

  public formGroup: FormGroup = this.fb.group({});
  public resolvedOptions: Record<string, SbdFormFieldOption[]> = {};
  public optionsLoading: Record<string, boolean> = {};
  public showPassword: Record<string, boolean> = {};
  public fileNames: Record<string, string> = {};
  public tagInputValues: Record<string, string> = {};       // raw text in tag input box
  public autocompleteInputs: Record<string, string> = {};   // displayed text for autocomplete
  public autocompleteOpen: Record<string, boolean> = {};    // dropdown open state
  public hoverRating: Record<string, number> = {};          // hovered star index

  // ─── Getters ────────────────────────────────────────────────────────────────

  get isEditMode(): boolean {
    return this.recordId !== null && this.recordId !== undefined && this.recordId !== '';
  }

  get resolvedTitle(): string {
    return this.title ?? this.config.title ?? 'Formulaire';
  }

  get resolvedSubtitle(): string | undefined {
    return this.subtitle ?? this.config.subtitle;
  }

  get resolvedSubmitLabel(): string {
    return this.submitLabel ?? this.config.submitLabel ?? 'Enregistrer';
  }

  get resolvedCancelLabel(): string {
    return this.cancelLabel ?? this.config.cancelLabel ?? 'Annuler';
  }

  get resolvedShowCancel(): boolean {
    return this.config.showCancel ?? this.showCancel;
  }

  get resolvedShowReset(): boolean {
    return this.config.showReset ?? this.showReset;
  }

  get resolvedReadOnly(): boolean {
    return this.config.readOnly ?? this.readOnly;
  }

  // ─── Lifecycle ──────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.buildForm();
    this.loadAsyncOptions();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['fields'] || changes['initialData'] || changes['recordId']) {
      this.buildForm();
      this.loadAsyncOptions();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ─── Form Building ──────────────────────────────────────────────────────────

  private buildForm(): void {
    const group: Record<string, any> = {};
    const crossValidators: ValidatorFn[] = [];

    this.fields.forEach(field => {
      if (field.type === 'divider' || field.type === 'heading') return;

      const validators = this.getValidators(field.validation, field.type);

      let value = field.defaultValue !== undefined ? field.defaultValue : this.getDefaultForType(field.type);

      if (this.initialData && this.initialData[field.key] !== undefined) {
        value = this.initialData[field.key];
      }

      group[field.key] = [
        { value, disabled: field.disabled || this.resolvedReadOnly },
        validators
      ];

      // ── Collect cross-field validators ──────────────────────────────────────
      if (field.validation?.matchField) {
        crossValidators.push(
          matchFieldValidator(
            field.key,
            field.validation.matchField,
            field.validation.matchFieldMsg ?? `Ce champ doit correspondre à "${field.validation.matchField}".`
          )
        );
      }

      // ── Sync autocomplete display value ────────────────────────────────────
      if (field.type === 'autocomplete' && value) {
        this.autocompleteInputs[field.key] = value;
      }
    });

    this.formGroup = this.fb.group(group, { validators: crossValidators });

    // Watch value changes for conditional visibility + field change events
    this.formGroup.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(val => {
        this.cdr.markForCheck();
        this.fieldChange.emit({ key: '', value: null, formValue: val });
      });
  }

  private getDefaultForType(type: string): any {
    switch (type) {
      case 'checkbox':
      case 'toggle':
        return false;
      case 'multiselect':
      case 'tag-input':
        return [];
      case 'range':
        return 50;
      case 'rating':
        return 0;
      case 'number':
        return null;
      default:
        return '';
    }
  }

  private loadAsyncOptions(): void {
    this.fields.forEach(field => {
      if (field.asyncOptions$) {
        this.optionsLoading[field.key] = true;
        this.resolvedOptions[field.key] = [];

        field.asyncOptions$
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: opts => {
              this.resolvedOptions[field.key] = opts;
              this.optionsLoading[field.key] = false;
              this.cdr.markForCheck();
            },
            error: () => {
              this.optionsLoading[field.key] = false;
              this.cdr.markForCheck();
            }
          });
      } else if (field.options) {
        this.resolvedOptions[field.key] = field.options;
      }
    });
  }

  // ─── Validators ─────────────────────────────────────────────────────────────

  private getValidators(
    validation: SbdFormFieldValidation | undefined,
    type?: string
  ): ValidatorFn[] {
    if (!validation) return type === 'email' ? [Validators.email] : [];

    const validators: ValidatorFn[] = [];

    if (validation.required) validators.push(Validators.required);
    if (validation.email || type === 'email') validators.push(Validators.email);
    if (validation.min !== undefined) validators.push(Validators.min(validation.min));
    if (validation.max !== undefined) validators.push(Validators.max(validation.max));
    if (validation.minLength !== undefined) validators.push(Validators.minLength(validation.minLength));
    if (validation.maxLength !== undefined) validators.push(Validators.maxLength(validation.maxLength));
    if (validation.pattern) validators.push(Validators.pattern(validation.pattern));

    return validators;
  }

  // ─── Conditional Display ────────────────────────────────────────────────────

  public isFieldVisible(field: SbdFormFieldSchema): boolean {
    if (!field.condition) return true;

    const watchControl = this.formGroup.get(field.condition.watchKey);
    if (!watchControl) return true;

    const currentValue = watchControl.value;
    const showWhen = field.condition.showWhen;

    if (Array.isArray(showWhen)) {
      return showWhen.includes(currentValue);
    }
    return currentValue === showWhen;
  }

  // ─── Validation State ───────────────────────────────────────────────────────

  public isFieldInvalid(key: string): boolean {
    const control = this.formGroup.get(key);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  public getFieldError(key: string): string | null {
    const control = this.formGroup.get(key);
    if (!control || !control.errors || !(control.dirty || control.touched)) return null;

    const errors = control.errors;
    const fieldSchema = this.fields.find(f => f.key === key);
    const customMsg = fieldSchema?.validation?.customValidatorMsg;

    if (customMsg) return customMsg;
    if (errors['required']) return 'Ce champ est obligatoire.';
    if (errors['email']) return 'Format d\'adresse email invalide.';
    if (errors['min']) return `La valeur minimale autorisée est ${errors['min'].min}.`;
    if (errors['max']) return `La valeur maximale autorisée est ${errors['max'].max}.`;
    if (errors['minlength']) return `Au moins ${errors['minlength'].requiredLength} caractères requis.`;
    if (errors['maxlength']) return `Maximum ${errors['maxlength'].requiredLength} caractères autorisés.`;
    if (errors['pattern']) return 'Format de donnée invalide.';
    if (errors['matchField']) return errors['matchField'].message ?? 'Les champs ne correspondent pas.';
    if (errors['fileSize']) return 'Le fichier dépasse la taille maximale autorisée.';

    return 'Valeur invalide.';
  }

  // ─── Multiselect ────────────────────────────────────────────────────────────

  public isOptionSelected(fieldKey: string, value: any): boolean {
    const control = this.formGroup.get(fieldKey);
    if (!control) return false;
    const current: any[] = control.value || [];
    return current.includes(value);
  }

  public toggleMultiOption(fieldKey: string, value: any): void {
    if (this.resolvedReadOnly) return;
    const control = this.formGroup.get(fieldKey);
    if (!control) return;

    const current: any[] = [...(control.value || [])];
    const idx = current.indexOf(value);

    if (idx === -1) {
      current.push(value);
    } else {
      current.splice(idx, 1);
    }

    control.setValue(current);
    control.markAsDirty();
  }

  public getMultiSelectedLabels(fieldKey: string): string {
    const control = this.formGroup.get(fieldKey);
    if (!control || !control.value?.length) return 'Aucune sélection';
    const opts = this.resolvedOptions[fieldKey] || [];
    return control.value
      .map((v: any) => opts.find(o => o.value === v)?.label ?? v)
      .join(', ');
  }

  // ─── Password Toggle ────────────────────────────────────────────────────────

  public togglePasswordVisibility(key: string): void {
    this.showPassword[key] = !this.showPassword[key];
  }

  public getPasswordInputType(key: string): string {
    return this.showPassword[key] ? 'text' : 'password';
  }

  // ─── File Input ─────────────────────────────────────────────────────────────

  public onFileChange(event: Event, fieldKey: string): void {
    const input = event.target as HTMLInputElement;
    const field = this.fields.find(f => f.key === fieldKey);
    const control = this.formGroup.get(fieldKey);

    if (!input.files || !control) return;

    const files = Array.from(input.files);
    const maxMb = field?.fileConfig?.maxSizeMb;

    if (maxMb) {
      const oversized = files.find(f => f.size > maxMb * 1024 * 1024);
      if (oversized) {
        control.setErrors({ fileSize: true });
        this.fileNames[fieldKey] = '';
        return;
      }
    }

    this.fileNames[fieldKey] = files.map(f => f.name).join(', ');
    control.setValue(field?.fileConfig?.multiple ? files : files[0]);
    control.markAsDirty();
  }

  // ─── Range ──────────────────────────────────────────────────────────────────

  public getRangeValue(key: string): number {
    return this.formGroup.get(key)?.value ?? 0;
  }

  // ─── Rating ─────────────────────────────────────────────────────────────────

  public getRatingStars(field: SbdFormFieldSchema): number[] {
    const max = field.ratingConfig?.maxStars ?? 5;
    return Array.from({ length: max }, (_, i) => i + 1);
  }

  public getRatingValue(key: string): number {
    return this.formGroup.get(key)?.value ?? 0;
  }

  public setRating(key: string, value: number): void {
    if (this.resolvedReadOnly) return;
    const control = this.formGroup.get(key);
    if (!control) return;
    const current = control.value;
    control.setValue(current === value ? 0 : value);
    control.markAsDirty();
    this.hoverRating[key] = 0;
  }

  public setHoverRating(key: string, value: number): void {
    this.hoverRating[key] = value;
  }

  public clearHoverRating(key: string): void {
    this.hoverRating[key] = 0;
  }

  public isStarActive(key: string, star: number): boolean {
    const hover = this.hoverRating[key] ?? 0;
    const current = this.getRatingValue(key);
    return star <= (hover || current);
  }

  // ─── Tag Input ──────────────────────────────────────────────────────────────

  public getTags(key: string): string[] {
    return this.formGroup.get(key)?.value ?? [];
  }

  public onTagKeydown(event: KeyboardEvent, fieldKey: string, field: SbdFormFieldSchema): void {
    if (this.resolvedReadOnly) return;
    const separators = field.tagConfig?.separators ?? ['Enter', ','];
    const isSeparator = separators.some(s => s === event.key || (s === ',' && event.key === ','));

    if (isSeparator) {
      event.preventDefault();
      this.addTag(fieldKey, field);
    }
    if (event.key === 'Backspace' && !this.tagInputValues[fieldKey]) {
      this.removeLastTag(fieldKey);
    }
  }

  public addTag(fieldKey: string, field: SbdFormFieldSchema): void {
    const rawValue = (this.tagInputValues[fieldKey] ?? '').trim().replace(/,$/, '');
    if (!rawValue) return;

    const control = this.formGroup.get(fieldKey);
    if (!control) return;

    const current: string[] = [...(control.value ?? [])];
    if (!current.includes(rawValue)) {
      current.push(rawValue);
      control.setValue(current);
      control.markAsDirty();
    }
    this.tagInputValues[fieldKey] = '';
  }

  public removeTag(fieldKey: string, tag: string): void {
    if (this.resolvedReadOnly) return;
    const control = this.formGroup.get(fieldKey);
    if (!control) return;
    const current: string[] = (control.value ?? []).filter((t: string) => t !== tag);
    control.setValue(current);
    control.markAsDirty();
  }

  private removeLastTag(fieldKey: string): void {
    const control = this.formGroup.get(fieldKey);
    if (!control) return;
    const current: string[] = [...(control.value ?? [])];
    if (current.length > 0) {
      current.pop();
      control.setValue(current);
      control.markAsDirty();
    }
  }

  // ─── Autocomplete ────────────────────────────────────────────────────────────

  public getAutocompleteFilteredOptions(fieldKey: string, field: SbdFormFieldSchema): SbdFormFieldOption[] {
    const inputText = this.autocompleteInputs[fieldKey] ?? '';
    const minChars = field.autocompleteConfig?.minChars ?? 1;
    if (inputText.length < minChars) return [];

    const allOpts = this.resolvedOptions[fieldKey] ?? field.options ?? [];
    const filtered = allOpts.filter(o =>
      o.label.toLowerCase().includes(inputText.toLowerCase()) ||
      String(o.value).toLowerCase().includes(inputText.toLowerCase())
    );

    const max = field.autocompleteConfig?.maxSuggestions ?? 10;
    return filtered.slice(0, max);
  }

  public onAutocompleteInput(event: Event, fieldKey: string, field: SbdFormFieldSchema): void {
    const input = event.target as HTMLInputElement;
    this.autocompleteInputs[fieldKey] = input.value;
    this.autocompleteOpen[fieldKey] = true;

    if (field.autocompleteConfig?.allowFreeText) {
      const control = this.formGroup.get(fieldKey);
      if (control) {
        control.setValue(input.value);
        control.markAsDirty();
      }
    } else {
      const control = this.formGroup.get(fieldKey);
      if (control) control.setValue('');
    }
    this.cdr.markForCheck();
  }

  public selectAutocompleteOption(fieldKey: string, option: SbdFormFieldOption): void {
    const control = this.formGroup.get(fieldKey);
    if (!control) return;
    control.setValue(option.value);
    control.markAsDirty();
    this.autocompleteInputs[fieldKey] = option.label;
    this.autocompleteOpen[fieldKey] = false;
    this.cdr.markForCheck();
  }

  public closeAutocomplete(fieldKey: string): void {
    setTimeout(() => {
      this.autocompleteOpen[fieldKey] = false;
      this.cdr.markForCheck();
    }, 150);
  }

  // ─── Grid ───────────────────────────────────────────────────────────────────

  public getGridClass(gridCols?: string): string {
    switch (gridCols) {
      case 'half': return 'col-span-12 md:col-span-6';
      case 'third': return 'col-span-12 md:col-span-4';
      case 'quarter': return 'col-span-12 md:col-span-3';
      case 'two-thirds': return 'col-span-12 md:col-span-8';
      default: return 'col-span-12';
    }
  }

  // ─── Form Actions ───────────────────────────────────────────────────────────

  public onSubmit(event: Event): void {
    event.preventDefault();

    if (this.resolvedReadOnly || this.loading) return;

    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      this.cdr.markForCheck();
      return;
    }

    const rawValue = this.formGroup.getRawValue();

    this.formSubmit.emit({
      mode: this.isEditMode ? 'edit' : 'create',
      recordId: this.recordId,
      value: rawValue,
      rawEvent: event
    });
  }

  public onCancel(): void {
    this.formCancel.emit();
  }

  public onReset(): void {
    this.buildForm();
    this.fileNames = {};
    this.tagInputValues = {};
    this.autocompleteInputs = {};
    this.autocompleteOpen = {};
    this.hoverRating = {};
    this.formReset.emit();
  }

  /** Programmatic reset with optional new data */
  public resetForm(newData?: Record<string, any>): void {
    if (newData) {
      this.initialData = newData;
    }
    this.buildForm();
    this.fileNames = {};
    this.tagInputValues = {};
    this.autocompleteInputs = {};
  }
}
