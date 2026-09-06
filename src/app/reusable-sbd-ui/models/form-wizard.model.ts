import { SbdFormFieldSchema, SbdFormSubmitEvent } from './form.model';

// ─── Wizard Step Definition ───────────────────────────────────────────────────

export interface SbdWizardStep {
  /** Unique identifier for the step */
  id: string;
  /** Step title displayed in the stepper header */
  label: string;
  /** Optional short description shown below the label */
  description?: string;
  /** Optional icon name */
  icon?: string;
  /** Fields belonging to this step */
  fields: SbdFormFieldSchema[];
  /** If true, this step can be skipped */
  optional?: boolean;
}

// ─── Wizard Events ────────────────────────────────────────────────────────────

export interface SbdWizardStepChangeEvent {
  previousStep: number;
  currentStep: number;
  stepId: string;
  /** Accumulated form values up to this step */
  partialValue: Record<string, any>;
}

export interface SbdWizardSubmitEvent<T = Record<string, any>>
  extends SbdFormSubmitEvent<T> {
  /** Total number of steps completed */
  totalSteps: number;
}

// ─── Wizard Config ────────────────────────────────────────────────────────────

export interface SbdWizardConfig {
  /** Title shown in the wizard header */
  title?: string;
  /** Subtitle shown in the wizard header */
  subtitle?: string;
  /** Label for the final submit button (default: 'Valider') */
  submitLabel?: string;
  /** Label for previous button (default: 'Précédent') */
  prevLabel?: string;
  /** Label for next button (default: 'Suivant') */
  nextLabel?: string;
  /** Whether the user can click a completed step to go back (default: true) */
  allowStepJump?: boolean;
  /** If true, show a step summary panel before final submit (default: false) */
  showReviewStep?: boolean;
}
