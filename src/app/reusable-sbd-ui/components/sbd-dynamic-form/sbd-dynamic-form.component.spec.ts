import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SimpleChange } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { describe, it, expect, beforeEach } from 'vitest';
import { SbdDynamicFormComponent } from './sbd-dynamic-form.component';
import { SbdFormFieldSchema, SbdFormSubmitEvent } from '../../models/form.model';

describe('SbdDynamicFormComponent', () => {
  let component: SbdDynamicFormComponent;
  let fixture: ComponentFixture<SbdDynamicFormComponent>;

  const mockFields: SbdFormFieldSchema[] = [
    {
      key: 'projectName',
      label: 'Nom du projet',
      type: 'text',
      placeholder: 'Entrez le nom',
      validation: { required: true }
    },
    {
      key: 'contactEmail',
      label: 'Email de contact',
      type: 'email',
      validation: { required: true, email: true }
    },
    {
      key: 'priorityScore',
      label: 'Score de priorité',
      type: 'number',
      validation: { min: 1, max: 10 }
    },
    {
      key: 'description',
      label: 'Description détaillée',
      type: 'textarea'
    },
    {
      key: 'category',
      label: 'Catégorie',
      type: 'select',
      options: [
        { label: 'Engineering', value: 'eng' },
        { label: 'Operations', value: 'ops' }
      ]
    },
    {
      key: 'isPublic',
      label: 'Projet public',
      type: 'checkbox',
      defaultValue: false
    },
    {
      key: 'tags',
      label: 'Mots-clés',
      type: 'checkbox-group',
      options: [
        { label: 'Frontend', value: 'fe' },
        { label: 'Backend', value: 'be' },
        { label: 'Cloud', value: 'cloud' }
      ],
      defaultValue: ['fe']
    },
    {
      key: 'secHeading',
      label: 'Section Décorative',
      type: 'heading',
      content: 'Infos complémentaires'
    },
    {
      key: 'secDivider',
      label: '',
      type: 'divider',
      content: 'Fin'
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SbdDynamicFormComponent, ReactiveFormsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(SbdDynamicFormComponent);
    component = fixture.componentInstance;
  });

  describe('Form Initialization and Control Setup', () => {
    it('should create the component and build form controls for input fields only', () => {
      component.fields = mockFields;
      fixture.detectChanges();

      expect(component).toBeTruthy();
      expect(component.formGroup).toBeTruthy();

      // Controls for standard input fields should exist
      expect(component.formGroup.contains('projectName')).toBe(true);
      expect(component.formGroup.contains('contactEmail')).toBe(true);
      expect(component.formGroup.contains('priorityScore')).toBe(true);
      expect(component.formGroup.contains('description')).toBe(true);
      expect(component.formGroup.contains('category')).toBe(true);
      expect(component.formGroup.contains('isPublic')).toBe(true);
      expect(component.formGroup.contains('tags')).toBe(true);

      // Structural elements must be excluded from form controls
      expect(component.formGroup.contains('secHeading')).toBe(false);
      expect(component.formGroup.contains('secDivider')).toBe(false);
    });

    it('should set default values according to field types and default values', () => {
      component.fields = mockFields;
      fixture.detectChanges();

      expect(component.formGroup.get('isPublic')?.value).toBe(false);
      expect(component.formGroup.get('tags')?.value).toEqual(['fe']);
      expect(component.formGroup.get('projectName')?.value).toBe('');
    });

    it('should populate form controls with initialData and initialValues (merging correctly)', () => {
      component.fields = mockFields;
      component.initialValues = { projectName: 'Initial Base', isPublic: true };
      component.initialData = { projectName: 'Overridden Name', contactEmail: 'test@example.com' };

      fixture.detectChanges();

      expect(component.formGroup.get('projectName')?.value).toBe('Overridden Name');
      expect(component.formGroup.get('contactEmail')?.value).toBe('test@example.com');
      expect(component.formGroup.get('isPublic')?.value).toBe(true);
    });
  });

  describe('Field Validation', () => {
    beforeEach(() => {
      component.fields = mockFields;
      fixture.detectChanges();
    });

    it('should validate required fields', () => {
      const nameCtrl = component.formGroup.get('projectName');
      nameCtrl?.setValue('');
      expect(nameCtrl?.valid).toBe(false);
      expect(nameCtrl?.hasError('required')).toBe(true);

      nameCtrl?.setValue('Mon Projet');
      expect(nameCtrl?.valid).toBe(true);
    });

    it('should validate email format', () => {
      const emailCtrl = component.formGroup.get('contactEmail');
      emailCtrl?.setValue('not-an-email');
      expect(emailCtrl?.valid).toBe(false);
      expect(emailCtrl?.hasError('email')).toBe(true);

      emailCtrl?.setValue('valid@test.com');
      expect(emailCtrl?.valid).toBe(true);
    });

    it('should validate min and max numeric constraints', () => {
      const scoreCtrl = component.formGroup.get('priorityScore');
      scoreCtrl?.setValue(0);
      expect(scoreCtrl?.hasError('min')).toBe(true);

      scoreCtrl?.setValue(11);
      expect(scoreCtrl?.hasError('max')).toBe(true);

      scoreCtrl?.setValue(5);
      expect(scoreCtrl?.valid).toBe(true);
    });

    it('should correctly report isFieldInvalid only when control is invalid and touched or dirty', () => {
      const nameCtrl = component.formGroup.get('projectName');
      nameCtrl?.setValue('');
      // Untouched and pristine -> not invalid for display
      expect(component.isFieldInvalid('projectName')).toBe(false);

      nameCtrl?.markAsTouched();
      expect(component.isFieldInvalid('projectName')).toBe(true);

      nameCtrl?.setValue('Valid Project');
      expect(component.isFieldInvalid('projectName')).toBe(false);
    });
  });

  describe('ngOnChanges and Rebuild', () => {
    it('should rebuild form when fields input changes', () => {
      component.fields = [{ key: 'firstField', label: 'First', type: 'text' }];
      fixture.detectChanges();
      expect(component.formGroup.contains('firstField')).toBe(true);

      const newFields: SbdFormFieldSchema[] = [
        { key: 'secondField', label: 'Second', type: 'text' }
      ];
      component.fields = newFields;
      component.ngOnChanges({
        fields: new SimpleChange(null, newFields, false)
      });

      expect(component.formGroup.contains('firstField')).toBe(false);
      expect(component.formGroup.contains('secondField')).toBe(true);
    });

    it('should rebuild and update values when initialData changes', () => {
      component.fields = [{ key: 'title', label: 'Title', type: 'text' }];
      fixture.detectChanges();

      component.initialData = { title: 'Updated Title' };
      component.ngOnChanges({
        initialData: new SimpleChange(null, { title: 'Updated Title' }, false)
      });

      expect(component.formGroup.get('title')?.value).toBe('Updated Title');
    });
  });

  describe('Form value changes emission', () => {
    it('should emit formChange whenever formGroup value changes', () => {
      component.fields = mockFields;
      fixture.detectChanges();

      let latestChange: any;
      component.formChange.subscribe((val) => (latestChange = val));

      component.formGroup.get('projectName')?.setValue('New Project Name');

      expect(latestChange).toBeTruthy();
      expect(latestChange['projectName']).toBe('New Project Name');
    });
  });

  describe('Checkbox-group operations', () => {
    beforeEach(() => {
      component.fields = mockFields;
      fixture.detectChanges();
    });

    it('should determine if an option is checked with isOptionChecked', () => {
      expect(component.isOptionChecked('tags', 'fe')).toBe(true);
      expect(component.isOptionChecked('tags', 'be')).toBe(false);
    });

    it('should toggle an option off when already checked', () => {
      component.onCheckboxGroupToggle('tags', 'fe');
      expect(component.formGroup.get('tags')?.value).toEqual([]);
      expect(component.isOptionChecked('tags', 'fe')).toBe(false);
      expect(component.formGroup.get('tags')?.dirty).toBe(true);
      expect(component.formGroup.get('tags')?.touched).toBe(true);
    });

    it('should toggle an option on when not checked', () => {
      component.onCheckboxGroupToggle('tags', 'cloud');
      expect(component.formGroup.get('tags')?.value).toEqual(['fe', 'cloud']);
      expect(component.isOptionChecked('tags', 'cloud')).toBe(true);
    });
  });

  describe('Form submission', () => {
    beforeEach(() => {
      component.fields = mockFields;
      fixture.detectChanges();
    });

    it('should mark all fields as touched and prevent submission when form is invalid', () => {
      let submittedEvent: SbdFormSubmitEvent | undefined;
      component.formSubmit.subscribe((ev) => (submittedEvent = ev));

      const fakeEvent = new Event('submit');
      component.onSubmit(fakeEvent);

      expect(submittedEvent).toBeUndefined();
      expect(component.formGroup.get('projectName')?.touched).toBe(true);
      expect(component.formGroup.get('contactEmail')?.touched).toBe(true);
    });

    it('should emit formSubmit with mode "create" when recordId is null', () => {
      component.formGroup.get('projectName')?.setValue('Valid Project');
      component.formGroup.get('contactEmail')?.setValue('valid@test.com');

      let submittedEvent: SbdFormSubmitEvent | undefined;
      component.formSubmit.subscribe((ev) => (submittedEvent = ev));

      const fakeEvent = new Event('submit');
      component.onSubmit(fakeEvent);

      expect(submittedEvent).toBeTruthy();
      expect(submittedEvent?.mode).toBe('create');
      expect(submittedEvent?.recordId).toBeNull();
      expect(submittedEvent?.value['projectName']).toBe('Valid Project');
      expect(submittedEvent?.value['contactEmail']).toBe('valid@test.com');
    });

    it('should emit formSubmit with mode "edit" when recordId is provided', () => {
      component.recordId = 'project-42';
      component.formGroup.get('projectName')?.setValue('Updated Project');
      component.formGroup.get('contactEmail')?.setValue('updated@test.com');

      let submittedEvent: SbdFormSubmitEvent | undefined;
      component.formSubmit.subscribe((ev) => (submittedEvent = ev));

      const fakeEvent = new Event('submit');
      component.onSubmit(fakeEvent);

      expect(submittedEvent?.mode).toBe('edit');
      expect(submittedEvent?.recordId).toBe('project-42');
    });
  });

  describe('Form reset and cancel', () => {
    it('should emit formCancel when cancel button is clicked', () => {
      component.fields = mockFields;
      fixture.detectChanges();

      let cancelEmitted = false;
      component.formCancel.subscribe(() => (cancelEmitted = true));

      const cancelBtn = fixture.nativeElement.querySelector('button[type="button"]:nth-of-type(1)');
      cancelBtn.click();

      expect(cancelEmitted).toBe(true);
    });

    it('should render reset button and reset formGroup when showReset is true', () => {
      component.fields = mockFields;
      component.showReset = true;
      fixture.detectChanges();

      component.formGroup.get('projectName')?.setValue('Something');
      const resetBtn = fixture.nativeElement.querySelector('button.bg-slate-100');
      expect(resetBtn.textContent).toContain('Réinitialiser');

      resetBtn.click();
      expect(component.formGroup.get('projectName')?.value).toBeNull();
    });
  });

  describe('DOM Elements and Template Rendering', () => {
    it('should render form title if provided', () => {
      component.fields = mockFields;
      component.title = 'Édition du projet';
      fixture.detectChanges();

      const heading = fixture.nativeElement.querySelector('h3');
      expect(heading?.textContent).toContain('Édition du projet');
    });

    it('should render heading and divider elements', () => {
      component.fields = mockFields;
      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      expect(el.textContent).toContain('Section Décorative');
      expect(el.textContent).toContain('Fin');
    });

    it('should render error span when a field is touched and invalid', () => {
      component.fields = mockFields;
      fixture.detectChanges();

      const nameCtrl = component.formGroup.get('projectName');
      nameCtrl?.setValue('');
      nameCtrl?.markAsTouched();
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      const errorSpans = Array.from(fixture.nativeElement.querySelectorAll('span.text-rose-600')) as HTMLElement[];
      const hasErrorMsg = errorSpans.some(s => s.textContent?.includes('Ce champ est requis ou invalide'));
      expect(hasErrorMsg).toBe(true);
    });

    it('should show loading text on submit button when loading is true', () => {
      component.fields = mockFields;
      component.loading = true;
      fixture.detectChanges();

      const submitBtn = fixture.nativeElement.querySelector('button[type="submit"]');
      expect(submitBtn.disabled).toBe(true);
      expect(submitBtn.textContent).toContain('Chargement...');
    });
  });
});
