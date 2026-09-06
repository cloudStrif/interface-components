import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  SimpleChanges,
  inject,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SbdFormFieldSchema, SbdFormSubmitEvent, SbdFormConfig } from '../../models/form.model';

@Component({
  selector: 'app-sbd-dynamic-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './sbd-dynamic-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SbdDynamicFormComponent implements OnInit, OnChanges {
  private fb = inject(FormBuilder);

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

  public formGroup: FormGroup = this.fb.group({});

  ngOnInit(): void {
    this.buildForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['fields'] || changes['initialData'] || changes['initialValues']) {
      this.buildForm();
    }
  }

  private buildForm(): void {
    const controls: Record<string, any> = {};
    const values = { ...(this.initialValues || {}), ...(this.initialData || {}) };

    this.fields.forEach(field => {
      const validators = [];
      if (field.validation?.required) validators.push(Validators.required);
      if (field.validation?.email) validators.push(Validators.email);
      if (field.validation?.min !== undefined) validators.push(Validators.min(field.validation.min));
      if (field.validation?.max !== undefined) validators.push(Validators.max(field.validation.max));

      const val = values[field.key] ?? field.defaultValue ?? '';
      controls[field.key] = [val, validators];
    });

    this.formGroup = this.fb.group(controls);
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
