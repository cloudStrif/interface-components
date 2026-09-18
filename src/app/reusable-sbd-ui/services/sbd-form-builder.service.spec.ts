import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { SbdFormBuilderService } from './sbd-form-builder.service';
import { of } from 'rxjs';

describe('SbdFormBuilderService', () => {
  let service: SbdFormBuilderService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SbdFormBuilderService]
    });
    service = TestBed.inject(SbdFormBuilderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should build text input field with validation and options using fluent API', () => {
    service
      .text('title', 'Titre du document')
      .placeholder('Ex: Rapport SBD')
      .defaultValue('Draft')
      .required('Le titre est obligatoire')
      .minLength(3)
      .maxLength(50)
      .helpText('Veuillez spécifier le titre officiel')
      .icon('document')
      .full()
      .build();

    const fields = service.getFields();
    expect(fields.length).toBe(1);
    expect(fields[0].key).toBe('title');
    expect(fields[0].type).toBe('text');
    expect(fields[0].label).toBe('Titre du document');
    expect(fields[0].placeholder).toBe('Ex: Rapport SBD');
    expect(fields[0].defaultValue).toBe('Draft');
    expect(fields[0].validation?.required).toBe(true);
    expect(fields[0].validation?.customValidatorMsg).toBe('Le titre est obligatoire');
    expect(fields[0].validation?.minLength).toBe(3);
    expect(fields[0].validation?.maxLength).toBe(50);
    expect(fields[0].helpText).toBe('Veuillez spécifier le titre officiel');
    expect(fields[0].icon).toBe('document');
    expect(fields[0].gridCols).toBe('full');

    // After getFields, accumulator should be reset
    expect(service.getFields().length).toBe(0);
  });

  it('should build number input with min and max constraints', () => {
    service
      .number('quantity', 'Quantité')
      .min(1)
      .max(100)
      .half()
      .build();

    const fields = service.getFields();
    expect(fields.length).toBe(1);
    expect(fields[0].validation?.min).toBe(1);
    expect(fields[0].validation?.max).toBe(100);
    expect(fields[0].gridCols).toBe('half');
  });

  it('should build email and password fields with pattern and matchField', () => {
    service
      .email('userEmail', 'Email')
      .email()
      .build()
      .password('pwd', 'Mot de passe')
      .pattern(/^[A-Za-z0-9]+$/, 'Alphanumérique uniquement')
      .build()
      .password('confirmPwd', 'Confirmer le mot de passe')
      .matchField('pwd', 'Les mots de passe ne correspondent pas')
      .build();

    const fields = service.getFields();
    expect(fields.length).toBe(3);
    expect(fields[0].validation?.email).toBe(true);
    expect(fields[1].validation?.pattern).toEqual(/^[A-Za-z0-9]+$/);
    expect(fields[2].validation?.matchField).toBe('pwd');
    expect(fields[2].validation?.matchFieldMsg).toBe('Les mots de passe ne correspondent pas');
  });

  it('should support options and asyncOptions on select fields', () => {
    const staticOptions = [{ label: 'Opt 1', value: 1 }];
    const asyncOptions$ = of([{ label: 'Async Opt', value: 2 }]);

    service
      .select('category', 'Catégorie')
      .options(staticOptions)
      .asyncOptions(asyncOptions$)
      .third()
      .build();

    const fields = service.getFields();
    expect(fields[0].options).toBe(staticOptions);
    expect(fields[0].asyncOptions$).toBe(asyncOptions$);
    expect(fields[0].gridCols).toBe('third');
  });

  it('should support conditional display (showWhen)', () => {
    service
      .text('otherDetail', 'Précisez')
      .showWhen('category', 'other')
      .quarter()
      .build();

    const fields = service.getFields();
    expect(fields[0].condition).toEqual({
      watchKey: 'category',
      showWhen: 'other'
    });
    expect(fields[0].gridCols).toBe('quarter');
  });

  it('should support specialized input configs (file, range, rating, autocomplete, tag)', () => {
    service
      .file('attachment', 'Fichier joint')
      .fileConfig({ accept: '.pdf,.docx', multiple: true, maxSizeMb: 10 })
      .build()
      .range('score', 'Score')
      .rangeConfig({ min: 0, max: 100, step: 5, unit: '%' })
      .build()
      .rating('eval', 'Évaluation')
      .ratingConfig({ maxStars: 5, allowHalf: true })
      .build()
      .autocomplete('searchProject', 'Projet')
      .autocompleteConfig({ minChars: 2, maxSuggestions: 5 })
      .build()
      .tags('keywords', 'Mots-clés')
      .tagConfig({ maxTags: 5, separators: [','] })
      .build();

    const fields = service.getFields();
    expect(fields[0].fileConfig?.accept).toBe('.pdf,.docx');
    expect(fields[1].rangeConfig?.unit).toBe('%');
    expect(fields[2].ratingConfig?.maxStars).toBe(5);
    expect(fields[3].autocompleteConfig?.minChars).toBe(2);
    expect(fields[4].tagConfig?.maxTags).toBe(5);
  });

  it('should add structural elements (divider, heading)', () => {
    service
      .heading('Informations Générales')
      .text('name', 'Nom')
      .build()
      .divider('Séparation')
      .text('comment', 'Commentaire')
      .twoThirds()
      .build();

    const fields = service.getFields();
    expect(fields.length).toBe(4);
    expect(fields[0].type).toBe('heading');
    expect(fields[0].content).toBe('Informations Générales');
    expect(fields[1].type).toBe('text');
    expect(fields[2].type).toBe('divider');
    expect(fields[2].content).toBe('Séparation');
    expect(fields[3].gridCols).toBe('two-thirds');
  });

  it('should allow reset() and peekFields() without emptying the list', () => {
    service.text('field1', 'F1').build();
    expect(service.peekFields().length).toBe(1);
    expect(service.peekFields().length).toBe(1);

    service.reset();
    expect(service.peekFields().length).toBe(0);
  });
});
