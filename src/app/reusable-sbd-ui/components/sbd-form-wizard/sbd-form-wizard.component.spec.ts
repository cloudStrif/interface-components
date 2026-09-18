import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { SbdFormWizardComponent } from './sbd-form-wizard.component';
import { SbdWizardStep } from '../../models/form-wizard.model';

describe('SbdFormWizardComponent', () => {
  let component: SbdFormWizardComponent;
  let fixture: ComponentFixture<SbdFormWizardComponent>;

  const mockSteps: SbdWizardStep[] = [
    {
      id: 'step-info',
      label: 'Informations Générales',
      description: 'Détails du projet',
      fields: [
        { key: 'projectName', label: 'Nom', type: 'text', validation: { required: true } }
      ]
    },
    {
      id: 'step-contact',
      label: 'Contact',
      description: 'Coordonnées',
      fields: [
        { key: 'email', label: 'Email', type: 'email', validation: { required: true } }
      ]
    },
    {
      id: 'step-review',
      label: 'Confirmation',
      fields: [
        { key: 'notes', label: 'Notes', type: 'textarea' }
      ]
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SbdFormWizardComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(SbdFormWizardComponent);
    component = fixture.componentInstance;
    component.steps = mockSteps;
  });

  it('should instantiate the wizard component with initial step 0', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
    expect(component.currentStepIndex()).toBe(0);
    expect(component.isFirstStep).toBe(true);
    expect(component.isLastStep).toBe(false);
    expect(component.progressPercentage).toBe(33);
  });

  it('should resolve default and configured titles and button labels', () => {
    expect(component.resolvedTitle).toBe('Assistant Multi-Étapes');
    expect(component.resolvedNextLabel).toBe('Suivant');
    expect(component.resolvedPrevLabel).toBe('Précédent');
    expect(component.resolvedSubmitLabel).toBe('Valider & Finaliser');

    component.config = {
      title: 'Mon Assistant Personnalisé',
      nextLabel: 'Étape suivante',
      prevLabel: 'Retour',
      submitLabel: 'Envoyer le dossier'
    };

    expect(component.resolvedTitle).toBe('Mon Assistant Personnalisé');
    expect(component.resolvedNextLabel).toBe('Étape suivante');
    expect(component.resolvedPrevLabel).toBe('Retour');
    expect(component.resolvedSubmitLabel).toBe('Envoyer le dossier');
  });

  it('should not advance to next step if dynamic form is invalid', () => {
    fixture.detectChanges();
    expect(component.dynamicFormComponent).toBeTruthy();

    component.nextStep();

    // Form is invalid (projectName required), so should stay on step 0
    expect(component.currentStepIndex()).toBe(0);
    expect(component.isFirstStep).toBe(true);
  });

  it('should advance to next step when dynamic form is valid and emit stepChange', () => {
    fixture.detectChanges();

    let stepChangeEvent: any;
    component.stepChange.subscribe((ev) => (stepChangeEvent = ev));

    // Fill valid data for step 1
    component.dynamicFormComponent?.formGroup.get('projectName')?.setValue('Projet Alpha');

    component.nextStep();

    expect(component.currentStepIndex()).toBe(1);
    expect(component.isFirstStep).toBe(false);
    expect(component.isLastStep).toBe(false);
    expect(component.accumulatedData['projectName']).toBe('Projet Alpha');
    expect(stepChangeEvent).toEqual({
      previousStep: 0,
      currentStep: 1,
      stepId: 'step-contact',
      partialValue: { projectName: 'Projet Alpha' }
    });
  });

  it('should allow going back to previous step with prevStep()', () => {
    fixture.detectChanges();

    component.dynamicFormComponent?.formGroup.get('projectName')?.setValue('Projet Alpha');
    component.nextStep();
    expect(component.currentStepIndex()).toBe(1);

    component.prevStep();
    expect(component.currentStepIndex()).toBe(0);
    expect(component.isFirstStep).toBe(true);
  });

  it('should allow jumping back to earlier step via goToStep()', () => {
    fixture.detectChanges();

    component.dynamicFormComponent?.formGroup.get('projectName')?.setValue('Projet Alpha');
    component.nextStep();
    expect(component.currentStepIndex()).toBe(1);

    component.goToStep(0);
    expect(component.currentStepIndex()).toBe(0);
  });

  it('should emit wizardSubmit on final step when submitted', () => {
    fixture.detectChanges();

    let submittedData: any;
    component.wizardSubmit.subscribe((ev) => (submittedData = ev));

    // Step 0
    component.dynamicFormComponent?.formGroup.get('projectName')?.setValue('Projet Alpha');
    component.nextStep();
    fixture.detectChanges();

    // Step 1
    component.dynamicFormComponent?.formGroup.get('email')?.setValue('test@sbd.com');
    component.nextStep();
    fixture.detectChanges();

    expect(component.currentStepIndex()).toBe(2);
    expect(component.isLastStep).toBe(true);
    expect(component.progressPercentage).toBe(100);

    // Step 2 (Final)
    component.dynamicFormComponent?.formGroup.get('notes')?.setValue('All good');
    component.nextStep();

    expect(submittedData).toBeTruthy();
    expect(submittedData.value['projectName']).toBe('Projet Alpha');
    expect(submittedData.value['email']).toBe('test@sbd.com');
    expect(submittedData.value['notes']).toBe('All good');
    expect(submittedData.totalSteps).toBe(3);
  });

  it('should emit wizardCancel when cancel is clicked', () => {
    let cancelEmitted = false;
    component.wizardCancel.subscribe(() => (cancelEmitted = true));

    component.onCancel();
    expect(cancelEmitted).toBe(true);
  });
});
