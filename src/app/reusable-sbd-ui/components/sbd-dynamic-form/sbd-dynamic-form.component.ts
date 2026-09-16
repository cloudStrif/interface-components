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
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { SbdFormFieldSchema, SbdFormSubmitEvent, SbdFormConfig } from '../../models/form.model';

@Component({
  selector: 'app-sbd-dynamic-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './sbd-dynamic-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SbdDynamicFormComponent implements OnInit, OnChanges, OnDestroy {
  private fb = inject(FormBuilder);
  private valueChangeSub?: Subscription;

  @Input({ required: true }) fields: SbdFormFieldSchema[] = [];
  @Input() initialData: Record<string, any> | null = {};
  @Input() initialValues: Record<string, any> | null = {};
  @Input() submitLabel: string = 'Enregistrer';
  @Input() loading: boolean = false;
  @Input() showReset: boolean = false;
  @Input() recordId: string | number | null = null;
  @Input() title: string = '';
  @Input() config: SbdFormConfig = {};

  @Output() formSubmit = new EventEmitter<SbdFormSubmitEvent>();
  @Output() formCancel = new EventEmitter<void>();
  @Output() formChange = new EventEmitter<Record<string, any>>();

  public formGroup: FormGroup = this.fb.group({});

  ngOnInit(): void {
    this.buildForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['fields'] || changes['initialData'] || changes['initialValues']) {
      this.buildForm();
    }
  }

  ngOnDestroy(): void {
    this.valueChangeSub?.unsubscribe();
  }

  private buildForm(): void {
    const controls: Record<string, any> = {};
    const values = { ...(this.initialValues || {}), ...(this.initialData || {}) };

    this.fields.forEach(field => {
      // Ignore les éléments purement structurels pour les contrôles du formulaire
      if (field.type === 'heading' || field.type === 'divider') {
        return;
      }

      const validators = [];
      if (field.validation?.required) validators.push(Validators.required);
      if (field.validation?.email) validators.push(Validators.email);
      if (field.validation?.min !== undefined) validators.push(Validators.min(field.validation.min));
      if (field.validation?.max !== undefined) validators.push(Validators.max(field.validation.max));

      let val = values[field.key] ?? field.defaultValue;

      if (field.type === 'checkbox-group') {
        val = Array.isArray(val) ? val : (field.defaultValue ?? []);
      } else if (field.type === 'checkbox') {
        val = typeof val === 'boolean' ? val : (field.defaultValue ?? false);
      } else if (val === undefined || val === null) {
        val = '';
      }

      controls[field.key] = [val, validators];
    });

    this.formGroup = this.fb.group(controls);

    this.valueChangeSub?.unsubscribe();
    this.valueChangeSub = this.formGroup.valueChanges.subscribe(val => {
      this.formChange.emit(val);
    });
  }

  public isOptionChecked(fieldKey: string, optValue: any): boolean {
    const ctrl = this.formGroup.get(fieldKey);
    const val = ctrl?.value;
    return Array.isArray(val) && val.includes(optValue);
  }

  public onCheckboxGroupToggle(fieldKey: string, optValue: any): void {
    const ctrl = this.formGroup.get(fieldKey);
    if (!ctrl) return;
    const current: any[] = Array.isArray(ctrl.value) ? [...ctrl.value] : [];
    const index = current.indexOf(optValue);
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(optValue);
    }
    ctrl.setValue(current);
    ctrl.markAsDirty();
    ctrl.markAsTouched();
  }

  public onSubmit(event: Event): void {
    event.preventDefault();
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }
    this.formSubmit.emit({
      mode: this.recordId ? 'edit' : 'create',
      recordId: this.recordId,
      value: this.formGroup.value,
      rawEvent: event
    });
  }

  public isFieldInvalid(key: string): boolean {
    const ctrl = this.formGroup.get(key);
    return !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched));
  }
}
