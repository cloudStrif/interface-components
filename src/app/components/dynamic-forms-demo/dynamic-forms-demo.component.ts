import { Component, signal, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  SbdDynamicFormComponent,
  SbdFormFieldSchema,
  SbdFormSubmitEvent,
  SbdFormBuilderService
} from '../../reusable-sbd-ui';

export type DemoMode = 'checkbox-groups' | 'sections-checkboxes';

@Component({
  selector: 'app-dynamic-forms-demo',
  standalone: true,
  imports: [CommonModule, RouterLink, SbdDynamicFormComponent],
  templateUrl: './dynamic-forms-demo.component.html',
  styleUrl: './dynamic-forms-demo.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DynamicFormsDemoComponent {
  private readonly formBuilderService = inject(SbdFormBuilderService);

  /** Onglet actif : 'checkbox-groups' ou 'sections-checkboxes' */
  public readonly activeTab = signal<DemoMode>('checkbox-groups');

  /** Données réactives du formulaire en cours de saisie */
  public readonly liveFormValue = signal<Record<string, any>>({});

  /** Dernier événement soumis avec succès */
  public readonly lastSubmittedEvent = signal<SbdFormSubmitEvent | null>(null);

  /**
   * ============================================================================
   * CAS 1 : Plusieurs groupes de checkbox avec un titre par groupe
   * (Chaque groupe 'nom' retourne un tableau de valeurs sélectionnées)
   * Ex : nom: ['mta', 'fmeca'], nom2: ['write', 'export']
   * ============================================================================
   */
  public readonly checkboxGroupsFields: SbdFormFieldSchema[] = [
    {
      key: 'modules',
      label: 'Nom 1 : Modules Fonctionnels Actifs',
      type: 'checkbox-group',
      gridCols: 'full',
      helpText: 'Sélectionnez les modules S3000L activés pour cette session utilisateur.',
      defaultValue: ['mta', 'fmeca'],
      options: [
        {
          label: 'Checkbox 1 : Analyse MTA (Task Cards)',
          value: 'mta',
          description: 'Maintenance Task Analysis et gammes de travail opérationnelles'
        },
        {
          label: 'Checkbox 2 : Analyse FMECA (AMDEC)',
          value: 'fmeca',
          description: 'Analyse des modes de défaillance, de leurs effets et de leur criticité'
        },
        {
          label: 'Checkbox 3 : Calcul LORA (Level of Repair)',
          value: 'lora',
          description: 'Optimisation économique des niveaux d\'échelon de maintenance'
        },
        {
          label: 'Checkbox 4 : Catalogue Pièces de Rechange (Support Items)',
          value: 'support_items',
          description: 'Gestion des articles matériels P/N, GSE et outillages spéciaux'
        }
      ]
    },
    {
      key: 'permissions',
      label: 'Nom 2 : Droits & Accréditations Opérationnelles',
      type: 'checkbox-group',
      gridCols: 'full',
      helpText: 'Niveaux d\'accès accordés sur la base de données BASL.',
      defaultValue: ['read', 'export_xml'],
      options: [
        {
          label: 'Checkbox 1 : Consultation en lecture seule',
          value: 'read',
          description: 'Parcours complet de la structure arborescente PBS / LCN'
        },
        {
          label: 'Checkbox 2 : Édition & Création d\'articles',
          value: 'write',
          description: 'Ajout de nouveaux composants matériels et tâches de soutien'
        },
        {
          label: 'Checkbox 3 : Export XML S3000L conforme ASD-STE',
          value: 'export_xml',
          description: 'Génération de fichiers d\'échange de données conformes au standard officiel'
        },
        {
          label: 'Checkbox 4 : Validation Qualité & Approbation LSA',
          value: 'audit_approval',
          description: 'Droit de validation formelle des livrables de maintenance'
        }
      ]
    },
    {
      key: 'notifications',
      label: 'Nom 3 : Canaux d\'Alerte & Surveillance',
      type: 'checkbox-group',
      gridCols: 'full',
      helpText: 'Flux de notifications automatiques lors des modifications de données.',
      defaultValue: ['email_critical', 'dashboard_live'],
      options: [
        {
          label: 'Checkbox 1 : Notifications Email (Alertes critiques)',
          value: 'email_critical',
          description: 'Envoi immédiat en cas de détection d\'incohérence LCN ou MTBF'
        },
        {
          label: 'Checkbox 2 : Dashboard Live & Télémétrie',
          value: 'dashboard_live',
          description: 'Flux en temps réel dans la barre d\'état supérieure'
        },
        {
          label: 'Checkbox 3 : Webhook API externe (ERP / PLM)',
          value: 'webhook_plm',
          description: 'Synchronisation automatique vers le système d\'information externe'
        }
      ]
    }
  ];

  /**
   * ============================================================================
   * CAS 2 : Titres de section ('heading') avec checkboxes individuelles
   * (Chaque checkbox retourne un booléen indépendant : true / false)
   * Ex : nom_1_cb1: true, nom_1_cb2: false, nom_2_cb1: true ...
   * ============================================================================
   */
  public readonly sectionsCheckboxesFields: SbdFormFieldSchema[] = [
    // ─── Section Nom 1 ────────────────────────────────────────────────────────
    {
      key: 'sec_import',
      type: 'heading',
      label: 'Nom 1 : Options d\'Importation des Données S3000L',
      content: 'Paramètres appliqués lors de l\'ingestion des fichiers XML S3000L Issue 1.1 / 2.0.'
    },
    {
      key: 'import_validate_xsd',
      label: 'Checkbox 1 : Valider strictement le schéma XSD officiel',
      type: 'checkbox',
      defaultValue: true,
      gridCols: 'half'
    },
    {
      key: 'import_preserve_lcn',
      label: 'Checkbox 2 : Conserver l\'indexation existante des codes LCN',
      type: 'checkbox',
      defaultValue: true,
      gridCols: 'half'
    },
    {
      key: 'import_gen_report',
      label: 'Checkbox 3 : Générer automatiquement un rapport d\'anomalies',
      type: 'checkbox',
      defaultValue: false,
      gridCols: 'half'
    },
    {
      key: 'import_auto_link',
      label: 'Checkbox 4 : Rattacher automatiquement les P/N aux tâches MTA',
      type: 'checkbox',
      defaultValue: true,
      gridCols: 'half'
    },

    // ─── Section Nom 2 ────────────────────────────────────────────────────────
    {
      key: 'sec_export',
      type: 'heading',
      label: 'Nom 2 : Options d\'Exportation & Sécurité',
      content: 'Restrictions et formatage lors de la génération des jeux de données de sortie.'
    },
    {
      key: 'export_include_attachments',
      label: 'Checkbox 1 : Inclure les pièces jointes et schémas techniques PDF',
      type: 'checkbox',
      defaultValue: false,
      gridCols: 'half'
    },
    {
      key: 'export_encrypt_archive',
      label: 'Checkbox 2 : Chiffrer l\'archive de sortie (AES-256)',
      type: 'checkbox',
      defaultValue: true,
      gridCols: 'half'
    },
    {
      key: 'export_notify_validators',
      label: 'Checkbox 3 : Notifier les validateurs du programme par email',
      type: 'checkbox',
      defaultValue: true,
      gridCols: 'half'
    },
    {
      key: 'export_archive_basl',
      label: 'Checkbox 4 : Archiver une copie dans le coffre-fort BASL',
      type: 'checkbox',
      defaultValue: false,
      gridCols: 'half'
    },

    // ─── Section Nom 3 ────────────────────────────────────────────────────────
    {
      key: 'sec_performance',
      type: 'heading',
      label: 'Nom 3 : Optimisations de Performance & Cache',
      content: 'Accélération des calculs FMECA et chargement mémoire.'
    },
    {
      key: 'perf_cache_pbs',
      label: 'Checkbox 1 : Activer la mise en cache de l\'arbre PBS',
      type: 'checkbox',
      defaultValue: true,
      gridCols: 'half'
    },
    {
      key: 'perf_async_eval',
      label: 'Checkbox 2 : Calcul asynchrone des indicateurs MTBF/MTTR',
      type: 'checkbox',
      defaultValue: true,
      gridCols: 'half'
    }
  ];

  /** Changement d'onglet */
  public setTab(tab: DemoMode): void {
    this.activeTab.set(tab);
    this.lastSubmittedEvent.set(null);
    this.liveFormValue.set({});
  }

  /** Mise à jour réactive des valeurs */
  public onFormChange(val: Record<string, any>): void {
    this.liveFormValue.set(val);
  }

  /** Soumission du formulaire */
  public onFormSubmit(event: SbdFormSubmitEvent): void {
    this.lastSubmittedEvent.set(event);
  }

  /** Annulation */
  public onFormCancel(): void {
    this.lastSubmittedEvent.set(null);
  }

  /** Code snippet de l'approche 1 pour l'affichage pédagogique */
  public readonly codeSnippetApproach1: string = `// ─── Approche 1 : Utilisation de 'checkbox-group' ──────────────────────────
// Idéal quand un titre regroupe plusieurs options dont les valeurs sont stockées
// dans un même tableau clé -> string[]

export const myFormFields: SbdFormFieldSchema[] = [
  {
    key: 'nom1',
    label: 'Nom 1 : Titre du premier groupe',
    type: 'checkbox-group',
    defaultValue: ['opt1', 'opt2'],
    options: [
      { label: 'Checkbox 1 : Libellé A', value: 'opt1' },
      { label: 'Checkbox 2 : Libellé B', value: 'opt2' },
      { label: 'Checkbox 3 : Libellé C', value: 'opt3' },
    ]
  },
  {
    key: 'nom2',
    label: 'Nom 2 : Titre du second groupe',
    type: 'checkbox-group',
    defaultValue: ['optB'],
    options: [
      { label: 'Checkbox 1 : Option A', value: 'optA' },
      { label: 'Checkbox 2 : Option B', value: 'optB' },
      { label: 'Checkbox 3 : Option C', value: 'optC' },
    ]
  }
];

// Résultat dans formGroup.value :
// {
//   nom1: ['opt1', 'opt2'],
//   nom2: ['optB']
// }`;

  /** Code snippet de l'approche 2 pour l'affichage pédagogique */
  public readonly codeSnippetApproach2: string = `// ─── Approche 2 : Titres de section 'heading' + 'checkbox' individuelles ──
// Idéal quand chaque checkbox est un champ booléen indépendant dans la base

export const myFormFields: SbdFormFieldSchema[] = [
  // ─── Groupe 1 ───
  { key: 'sec_1', type: 'heading', label: 'Nom 1 : Modules Système' },
  { key: 'opt_1_1', type: 'checkbox', label: 'Checkbox 1', defaultValue: true },
  { key: 'opt_1_2', type: 'checkbox', label: 'Checkbox 2', defaultValue: false },
  { key: 'opt_1_3', type: 'checkbox', label: 'Checkbox 3', defaultValue: true },

  // ─── Groupe 2 ───
  { key: 'sec_2', type: 'heading', label: 'Nom 2 : Paramètres Réseau' },
  { key: 'opt_2_1', type: 'checkbox', label: 'Checkbox 1', defaultValue: false },
  { key: 'opt_2_2', type: 'checkbox', label: 'Checkbox 2', defaultValue: true }
];

// Résultat dans formGroup.value :
// {
//   opt_1_1: true,
//   opt_1_2: false,
//   opt_1_3: true,
//   opt_2_1: false,
//   opt_2_2: true
// }`;
}
