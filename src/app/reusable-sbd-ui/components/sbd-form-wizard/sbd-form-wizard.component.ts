import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  inject,
  signal,
  computed,
  ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { SbdDynamicFormComponent } from '../sbd-dynamic-form/sbd-dynamic-form.component';
import {
  SbdWizardStep,
  SbdWizardStepChangeEvent,
  SbdWizardSubmitEvent,
  SbdWizardConfig
} from '../../models/form-wizard.model';
import { SbdFormSubmitEvent } from '../../models/form.model';

@Component({
  selector: 'app-sbd-form-wizard',
  standalone: true,
  imports: [CommonModule, SbdDynamicFormComponent],
  templateUrl: './sbd-form-wizard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SbdFormWizardComponent {
  private cdr = inject(ChangeDetectorRef);

  @ViewChild(SbdDynamicFormComponent) dynamicFormComponent?: SbdDynamicFormComponent;

  // ─── Required Inputs ────────────────────────────────────────────────────────

  @Input({ required: true }) steps: SbdWizardStep[] = [];

  // ─── Optional Inputs ────────────────────────────────────────────────────────

  @Input() initialData: Record<string, any> | null = null;
  @Input() config: SbdWizardConfig = {};
  @Input() loading: boolean = false;

  // ─── Outputs ────────────────────────────────────────────────────────────────

  @Output() wizardSubmit = new EventEmitter<SbdWizardSubmitEvent>();
  @Output() stepChange = new EventEmitter<SbdWizardStepChangeEvent>();
  @Output() wizardCancel = new EventEmitter<void>();

  // ─── Internal State ─────────────────────────────────────────────────────────

  public currentStepIndex = signal<number>(0);
  public accumulatedData: Record<string, any> = {};

  // ─── Getters ────────────────────────────────────────────────────────────────

  get currentStep(): SbdWizardStep | undefined {
    return this.steps[this.currentStepIndex()];
  }

  get isFirstStep(): boolean {
    return this.currentStepIndex() === 0;
  }

  get isLastStep(): boolean {
    return this.currentStepIndex() === this.steps.length - 1;
  }

  get progressPercentage(): number {
    if (this.steps.length <= 1) return 100;
    return Math.round(((this.currentStepIndex() + 1) / this.steps.length) * 100);
  }

  get resolvedTitle(): string {
    return this.config.title ?? 'Assistant Multi-Étapes';
  }

  get resolvedSubtitle(): string | undefined {
    return this.config.subtitle;
  }

  get resolvedNextLabel(): string {
    return this.config.nextLabel ?? 'Suivant';
  }

  get resolvedPrevLabel(): string {
    return this.config.prevLabel ?? 'Précédent';
  }

  get resolvedSubmitLabel(): string {
    return this.config.submitLabel ?? 'Valider & Finaliser';
  }

  // ─── Step Navigation Handlers ───────────────────────────────────────────────

  public goToStep(targetIndex: number): void {
    if (targetIndex < 0 || targetIndex >= this.steps.length) return;

    // Allow jumping back to previously visited steps if configured
    const allowJump = this.config.allowStepJump ?? true;
    if (targetIndex < this.currentStepIndex() && allowJump) {
      this.changeStepIndex(targetIndex);
    }
  }

  public nextStep(): void {
    if (!this.dynamicFormComponent) return;

    // Force validation of current step's form
    const formGroup = this.dynamicFormComponent.formGroup;
    if (formGroup.invalid) {
      formGroup.markAllAsTouched();
      this.cdr.markForCheck();
      return;
    }

    // Merge current step values into accumulatedData
    const currentValues = formGroup.getRawValue();
    this.accumulatedData = { ...this.accumulatedData, ...currentValues };

    if (this.isLastStep) {
      // Complete Wizard Submit
      this.wizardSubmit.emit({
        mode: 'create',
        recordId: null,
        value: this.accumulatedData,
        rawEvent: new Event('submit'),
        totalSteps: this.steps.length
      });
    } else {
      this.changeStepIndex(this.currentStepIndex() + 1);
    }
  }

  public prevStep(): void {
    if (this.isFirstStep) return;

    // Save partial values without blocking on validation errors when moving backwards
    if (this.dynamicFormComponent) {
      const currentValues = this.dynamicFormComponent.formGroup.getRawValue();
      this.accumulatedData = { ...this.accumulatedData, ...currentValues };
    }

    this.changeStepIndex(this.currentStepIndex() - 1);
  }

  private changeStepIndex(newIndex: number): void {
    const prev = this.currentStepIndex();
    this.currentStepIndex.set(newIndex);

    this.stepChange.emit({
      previousStep: prev,
      currentStep: newIndex,
      stepId: this.steps[newIndex]?.id ?? '',
      partialValue: this.accumulatedData
    });

    this.cdr.markForCheck();
  }

  public onStepFormSubmit(event: SbdFormSubmitEvent): void {
    // Intercept form submit inside the step
    this.nextStep();
  }

  public onCancel(): void {
    this.wizardCancel.emit();
  }
}
