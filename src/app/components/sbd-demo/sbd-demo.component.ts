import { Component, signal, WritableSignal, ChangeDetectionStrategy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { of, delay } from 'rxjs';
import {
  SbdDropdownComponent,
  SbdFileTreeComponent,
  SbdCdkFileTreeComponent,
  SbdDynamicFormComponent,
  SbdFormWizardComponent,
  SbdFormBuilderService,
  SbdDropdownOption,
  SbdDropdownAdapter,
  SbdDropdownActionEvent,
  SbdTreeNode,
  SbdNodeActionEvent,
  SbdFormFieldSchema,
  SbdFormSubmitEvent,
  SbdFormFieldChangeEvent,
  SbdWizardStep,
  SbdWizardSubmitEvent
} from '../../reusable-sbd-ui';

// ─── Modèles bobo Patroller (Base d'Analyse du Soutien Logistique) ───────────

export interface boboPatrollerItemPayload {
  lcnCode: string;             // Logistics Control Number (ex: LCN-PATROL-410)
  itemName: string;            // Désignation équipement
  systemCategory: 'OPTICAL_PAYLOAD' | 'AVIONICS_BUS' | 'GROUND_CONTROL' | 'PROPULSION' | 'DATA_LINK' | 'MCO_TOOLS';
  criticalityLevel: 'CRITICAL_A' | 'HIGH_B' | 'STANDARD_C';
  leadUnit: string;            // Unité militaire / Armée de Terre
  mtbfHours: number;           // Mean Time Between Failures
  mttrHours: number;           // Mean Time To Repair
  documentationRef: string;    // Référence S1000D
  maintenanceTools?: string[]; // Outillages MCO requis
  isOperationalMco?: boolean;  // Statut MCO Validé
}

@Component({
  selector: 'app-sbd-demo',
  standalone: true,
  imports: [
    CommonModule,
    SbdDropdownComponent,
    SbdFileTreeComponent,
    SbdCdkFileTreeComponent,
    SbdDynamicFormComponent,
    SbdFormWizardComponent
  ],
  templateUrl: './sbd-demo.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SbdDemoComponent implements OnInit {
  private formBuilderService = inject(SbdFormBuilderService);

  // Active Tab Signal ('bobo-form' | 'bobo-wizard' | 'bobo-tree')
  public activeTab: WritableSignal<'bobo-form' | 'bobo-wizard' | 'bobo-tree'> = signal('bobo-tree');

  // Sub-tab for Tree comparison ('both' | 'custom' | 'cdk')
  public treeMode: WritableSignal<'both' | 'custom' | 'cdk'> = signal('both');

  // Loading & State Signals
  public isApiLoading: WritableSignal<boolean> = signal(false);
  public isFormSubmitting: WritableSignal<boolean> = signal(false);
  public isWizardSubmitting: WritableSignal<boolean> = signal(false);

  public boboItems: WritableSignal<boboPatrollerItemPayload[]> = signal([]);
  public selectedboboItem: WritableSignal<boboPatrollerItemPayload | null> = signal(null);
  public editingLcnCode: WritableSignal<string | null> = signal(null);
  public boboInitialData: WritableSignal<Record<string, any> | null> = signal(null);

  // Tree Node Selection Signal
  public selectedFileNode: WritableSignal<SbdTreeNode<boboPatrollerItemPayload> | null> = signal(null);

  public toastMessage: WritableSignal<string | null> = signal(null);
  public wizardResultData: WritableSignal<Record<string, any> | null> = signal(null);

  // Actions pour le Dropdown bobo
  public dropdownActions = [
    { action: 'view-details', label: 'Consulter Fiche bobo', icon: 'view-details' },
    { action: 'pin', label: 'Épingler au MCO', icon: 'pin' }
  ];

  // Actions pour l'Arborescence Logistique bobo Patroller
  public fileTreeActions = [
    { action: 'open', label: 'Consulter Notice S1000D', icon: 'open' },
    { action: 'download', label: 'Exporter Données bobo', icon: 'download' }
  ];

  // ─── Arborescence Hiérarchique Logistique bobo Sbd Patroller ────────────

  public sbdFileTree: SbdTreeNode<boboPatrollerItemPayload>[] = [
    {
      id: 'root-patroller',
      name: 'SDT_PATROLLER_SYSTEM_ROOT',
      type: 'folder',
      isExpanded: true,
      children: [
        // ── 01. VECTEUR AÉRIEN & CELLULE
        {
          id: 'dir-vecteur',
          name: '01_VECTEUR_AERIEN_CELLULE',
          type: 'folder',
          isExpanded: true,
          children: [
            // 1.1 Charge Utile Optronique
            {
              id: 'dir-optronique',
              name: '1.1_CHARGE_UTILE_OPTRONIQUE',
              type: 'folder',
              isExpanded: true,
              children: [
                {
                  id: 'node-euroflir410',
                  name: 'Euroflir_410_Capteur_Optronique_HD.bobo',
                  type: 'file',
                  extension: 'json',
                  size: '142 KB',
                  modifiedDate: '2026-09-03 14:10',
                  badge: 'CRITIQUE A',
                  badgeColor: 'red',
                  data: {
                    lcnCode: 'PATROL-OPT-410',
                    itemName: 'Boule Optronique Euroflir 410 HD/IR/Laser',
                    systemCategory: 'OPTICAL_PAYLOAD',
                    criticalityLevel: 'CRITICAL_A',
                    leadUnit: '61e Régiment d\'Artillerie (61e RA)',
                    mtbfHours: 2500,
                    mttrHours: 4.0,
                    documentationRef: 'S1000D-SAF-PATROL-410-01',
                    maintenanceTools: ['Banc Optronique ATE Villaroche', 'Calibreur Laser STANAG'],
                    isOperationalMco: true
                  }
                },
                {
                  id: 'node-laser',
                  name: 'Laser_Designateur_Cible_STANAG_3733.bobo',
                  type: 'file',
                  extension: 'json',
                  size: '68 KB',
                  modifiedDate: '2026-08-28 11:30',
                  badge: 'HAUTE B',
                  badgeColor: 'amber',
                  data: {
                    lcnCode: 'PATROL-OPT-LASER',
                    itemName: 'Désignateur Laser & Télémètre STANAG 3733',
                    systemCategory: 'OPTICAL_PAYLOAD',
                    criticalityLevel: 'HIGH_B',
                    leadUnit: '61e RA / DGA EV',
                    mtbfHours: 3800,
                    mttrHours: 2.0,
                    documentationRef: 'S1000D-SAF-PATROL-LASER-02',
                    maintenanceTools: ['Mètre Laser Référent', 'Banc Calibreur Optical'],
                    isOperationalMco: true
                  }
                },
                {
                  id: 'node-radar-sar',
                  name: 'Radar_SAR_GMTI_Imagerie_Meteo.bobo',
                  type: 'file',
                  extension: 'json',
                  size: '115 KB',
                  modifiedDate: '2026-08-22 09:45',
                  badge: 'HAUTE B',
                  badgeColor: 'amber',
                  data: {
                    lcnCode: 'PATROL-RADAR-SAR',
                    itemName: 'Radar d\'Imagerie Synthétique SAR/GMTI',
                    systemCategory: 'OPTICAL_PAYLOAD',
                    criticalityLevel: 'HIGH_B',
                    leadUnit: 'DGA Essais de Vol',
                    mtbfHours: 4200,
                    mttrHours: 3.5,
                    documentationRef: 'S1000D-SAF-PATROL-SAR-05',
                    maintenanceTools: ['Analyseur RF Ku-Band'],
                    isOperationalMco: true
                  }
                }
              ]
            },

            // 1.2 Avionique et Commande de Vol
            {
              id: 'dir-avionique',
              name: '1.2_AVIONIQUE_ET_COMMANDE_DE_VOL',
              type: 'folder',
              isExpanded: true,
              children: [
                {
                  id: 'node-fcc',
                  name: 'FCC_Calculateur_Vol_Principal_MIL1553.bobo',
                  type: 'file',
                  extension: 'json',
                  size: '96 KB',
                  modifiedDate: '2026-09-01 08:20',
                  badge: 'CRITIQUE A',
                  badgeColor: 'red',
                  data: {
                    lcnCode: 'PATROL-AVIO-FCC',
                    itemName: 'Flight Control Computer (FCC) Triples Redondances',
                    systemCategory: 'AVIONICS_BUS',
                    criticalityLevel: 'CRITICAL_A',
                    leadUnit: 'Sbd Electronics & Defense',
                    mtbfHours: 5000,
                    mttrHours: 1.5,
                    documentationRef: 'S1000D-SAF-PATROL-FCC-10',
                    maintenanceTools: ['Banc Valise Testeur Bus MIL-STD-1553'],
                    isOperationalMco: true
                  }
                },
                {
                  id: 'node-sigma30',
                  name: 'Centrale_Inertielle_SIGMA_30_GPS.bobo',
                  type: 'file',
                  extension: 'json',
                  size: '82 KB',
                  modifiedDate: '2026-08-29 16:00',
                  badge: 'CRITIQUE A',
                  badgeColor: 'red',
                  data: {
                    lcnCode: 'PATROL-NAV-SIGMA',
                    itemName: 'Centrale d\'Navigation Inertielle SIGMA 30 Laser',
                    systemCategory: 'AVIONICS_BUS',
                    criticalityLevel: 'CRITICAL_A',
                    leadUnit: 'Sbd Electronics & Defense Montluçon',
                    mtbfHours: 7500,
                    mttrHours: 1.0,
                    documentationRef: 'S1000D-SAF-PATROL-SIGMA-04',
                    maintenanceTools: ['Aligneur Gyrolaser ATE'],
                    isOperationalMco: true
                  }
                }
              ]
            },

            // 1.3 Groupe Motopropulseur
            {
              id: 'dir-propulsion',
              name: '1.3_GROUPE_MOTOPROPULSEUR',
              type: 'folder',
              isExpanded: false,
              children: [
                {
                  id: 'node-rotax',
                  name: 'Moteur_Rotax_914_Turbo_Airflow.bobo',
                  type: 'file',
                  extension: 'json',
                  size: '154 KB',
                  modifiedDate: '2026-08-25 14:00',
                  badge: 'CRITIQUE A',
                  badgeColor: 'red',
                  data: {
                    lcnCode: 'PATROL-PROP-MTR',
                    itemName: 'Moteur Quatre-Cylindres Turbocompressé Rotax 914',
                    systemCategory: 'PROPULSION',
                    criticalityLevel: 'CRITICAL_A',
                    leadUnit: 'SIMMT Terrestre',
                    mtbfHours: 1800,
                    mttrHours: 5.0,
                    documentationRef: 'S1000D-SAF-PATROL-MTR-01',
                    maintenanceTools: ['Banc Révision Moteur Rotax'],
                    isOperationalMco: true
                  }
                }
              ]
            }
          ]
        },

        // ── 02. STATION SOL GCS
        {
          id: 'dir-gcs',
          name: '02_STATION_SOL_GCS_GROUND_CONTROL',
          type: 'folder',
          isExpanded: true,
          children: [
            {
              id: 'dir-consoles',
              name: '2.1_CONSOLES_TACTIQUES',
              type: 'folder',
              isExpanded: true,
              children: [
                {
                  id: 'node-gcs-pilot',
                  name: 'Console_Pilote_GCS_Ecran_Tactique.bobo',
                  type: 'file',
                  extension: 'json',
                  size: '185 KB',
                  modifiedDate: '2026-09-02 10:15',
                  badge: 'CRITIQUE A',
                  badgeColor: 'red',
                  data: {
                    lcnCode: 'PATROL-GCS-PILOT',
                    itemName: 'Console Ground Control Station Pilote Drone',
                    systemCategory: 'GROUND_CONTROL',
                    criticalityLevel: 'CRITICAL_A',
                    leadUnit: '61e Régiment d\'Artillerie',
                    mtbfHours: 6500,
                    mttrHours: 1.0,
                    documentationRef: 'S1000D-SAF-PATROL-GCS-01',
                    maintenanceTools: ['Banc Test STANAG 4586'],
                    isOperationalMco: true
                  }
                },
                {
                  id: 'node-gcs-roim',
                  name: 'Console_Operateur_ROIM_Renseignement.bobo',
                  type: 'file',
                  extension: 'json',
                  size: '210 KB',
                  modifiedDate: '2026-09-01 16:30',
                  badge: 'HAUTE B',
                  badgeColor: 'amber',
                  data: {
                    lcnCode: 'PATROL-GCS-ROIM',
                    itemName: 'Console Exploitation Renseignement Vidéo STANAG 4609',
                    systemCategory: 'GROUND_CONTROL',
                    criticalityLevel: 'HIGH_B',
                    leadUnit: '61e RA / BRGE',
                    mtbfHours: 6000,
                    mttrHours: 1.5,
                    documentationRef: 'S1000D-SAF-PATROL-GCS-02',
                    maintenanceTools: ['Décodeur Flux Vidéo STANAG'],
                    isOperationalMco: true
                  }
                }
              ]
            },
            {
              id: 'dir-datalink',
              name: '2.2_LIAISONS_DE_DONNEES_DATALINK',
              type: 'folder',
              isExpanded: true,
              children: [
                {
                  id: 'node-dl-los',
                  name: 'Terminal_Liaison_LOS_Directe_KuBand.bobo',
                  type: 'file',
                  extension: 'json',
                  size: '98 KB',
                  modifiedDate: '2026-08-31 15:40',
                  badge: 'CRITIQUE A',
                  badgeColor: 'red',
                  data: {
                    lcnCode: 'PATROL-DL-LOS',
                    itemName: 'Antenne Suiveuse et Terminal LOS Ku-Band Direct',
                    systemCategory: 'DATA_LINK',
                    criticalityLevel: 'CRITICAL_A',
                    leadUnit: 'Sbd Electronics & Defense',
                    mtbfHours: 4000,
                    mttrHours: 2.0,
                    documentationRef: 'S1000D-SAF-PATROL-DL-01',
                    maintenanceTools: ['Testeur Puissance RF Ku'],
                    isOperationalMco: true
                  }
                }
              ]
            }
          ]
        },

        // ── 03. OUTILLAGES & BANCS MCO
        {
          id: 'dir-mco-tools',
          name: '03_OUTILLAGES_ET_BANCS_TEST_MCO',
          type: 'folder',
          isExpanded: false,
          children: [
            {
              id: 'node-ate-villaroche',
              name: 'Banc_Test_Optronique_ATE_Villaroche.bobo',
              type: 'file',
              extension: 'json',
              size: '310 KB',
              modifiedDate: '2026-08-20 09:00',
              badge: 'STANDARD C',
              badgeColor: 'green',
              data: {
                lcnCode: 'PATROL-MCO-ATE',
                itemName: 'Banc Automatique de Test (ATE) Euroflir Villaroche',
                systemCategory: 'MCO_TOOLS',
                criticalityLevel: 'STANDARD_C',
                leadUnit: 'Sbd Villaroche',
                mtbfHours: 8000,
                mttrHours: 1.0,
                documentationRef: 'S1000D-SAF-PATROL-MCO-01',
                maintenanceTools: ['Calibration Annuelle Sbd'],
                isOperationalMco: true
              }
            }
          ]
        }
      ]
    }
  ];

  public boboFormFields: SbdFormFieldSchema[] = [];
  public wizardSteps: SbdWizardStep[] = [];

  ngOnInit(): void {
    this.fetchMockboboItems();
    this.initboboFormFields();
    this.initWizardSteps();
    // Select first file node by default
    const firstNode = this.sbdFileTree[0]?.children?.[0]?.children?.[0]?.children?.[0];
    if (firstNode) {
      this.selectedFileNode.set(firstNode);
    }
  }

  // ─── Initialisation du Schéma de Formulaire bobo Patroller ────────────────

  private initboboFormFields(): void {
    this.boboFormFields = this.formBuilderService
      .reset()
      .heading('Fiche d\'Élément de Soutien Logistique — bobo Sbd Patroller')
      .text('lcnCode', 'Code LCN (Logistics Control Number)').required().minLength(4).half()
      .placeholder('ex: LCN-PATROLLER-410-A1')
      .helpText('Code de contrôle logistique norme MIL-STD-1388 / S3000L')
      .build()
      .text('itemName', 'Désignation de l\'Équipement').required().half()
      .placeholder('ex: Boule Optronique Euroflir 410')
      .build()
      .select('systemCategory', 'Sous-Système Drone Patroller').required().third()
      .options([
        { label: 'Charge Utile Optronique (Euroflir)', value: 'OPTICAL_PAYLOAD' },
        { label: 'Bus Avionique & Calculateur de Vol', value: 'AVIONICS_BUS' },
        { label: 'Station Sol de Contrôle GCS', value: 'GROUND_CONTROL' },
        { label: 'Groupe Motopropulseur & Fuel', value: 'PROPULSION' },
        { label: 'Liaison de Données Sécurisée (Datalink)', value: 'DATA_LINK' }
      ])
      .build()
      .select('criticalityLevel', 'Niveau de Criticité MCO').required().third()
      .options([
        { label: 'CRITIQUE A (Immobilisation vecteur)', value: 'CRITICAL_A' },
        { label: 'HAUTE B (Dégradation opérationnelle)', value: 'HIGH_B' },
        { label: 'STANDARD C (Soutien préventif)', value: 'STANDARD_C' }
      ])
      .build()
      .autocomplete('leadUnit', 'Unité / Organisme Référent').required().third()
      .placeholder('Rechercher une unité...')
      .options([
        { label: '61e Régiment d\'Artillerie (61e RA - Chaumont)', value: '61RA' },
        { label: 'DGA Essais de Vol (Cazaux)', value: 'DGA_EV' },
        { label: 'Sbd Electronics & Defense (Montluçon)', value: 'SAF_SED' },
        { label: 'SIMMT - Structure du Soutien Terrestre', value: 'SIMMT' }
      ])
      .build()
      .divider('Analyse de Maintenabilité & Fiabilité (AMDEC / FMEA)')
      .number('mtbfHours', 'MTBF — Mean Time Between Failures (heures)').required().half()
      .placeholder('ex: 2500')
      .min(10)
      .build()
      .number('mttrHours', 'MTTR — Mean Time To Repair (heures)').required().half()
      .placeholder('ex: 3.5')
      .min(0.5)
      .build()
      .tags('maintenanceTools', 'Outillages & Bancs MCO Spécifiques').full()
      .placeholder('Ajoutez un outillage et appuyez sur Entrée...')
      .tagConfig({ suggestions: ['Banc Optronique ATE', 'Analyseur Bus MIL-1553', 'Valise Télémétrie Ku', 'Outillage Moteur Rotax'] })
      .helpText('Outillages de soutien logistique nécessaires pour la maintenance')
      .build()
      .text('documentationRef', 'Référence Documentation S1000D / DTM').required().half()
      .placeholder('ex: S1000D-SAF-PATROLLER-61-00-00')
      .build()
      .toggle('isOperationalMco', 'Élément Qualifié MCO Armée de Terre').half()
      .defaultValue(true)
      .build()
      .getFields();
  }

  private initWizardSteps(): void {
    // Étape 1 : Identification LCN Patroller
    const step1 = this.formBuilderService
      .reset()
      .text('lcnCode', 'Code LCN (Logistics Control Number)').required().half().placeholder('ex: LCN-PATROL-04-A').build()
      .text('itemName', 'Nom de l\'Équipement Patroller').required().half().placeholder('ex: Calculateur de Vol Avionique FCC').build()
      .select('systemCategory', 'Sous-Système Drone').required().half()
      .options([
        { label: 'Optronique Euroflir 410', value: 'OPTICAL_PAYLOAD' },
        { label: 'Calculateur FCC / Avionique', value: 'AVIONICS_BUS' },
        { label: 'Station Sol GCS', value: 'GROUND_CONTROL' },
        { label: 'Motopropulseur', value: 'PROPULSION' }
      ]).build()
      .autocomplete('leadUnit', 'Affectation Unité').required().half()
      .options([
        { label: '61e Régiment d\'Artillerie (Drone Tactique)', value: '61RA' },
        { label: 'DGA Essais de Vol', value: 'DGA_EV' },
        { label: 'Sbd Defense Support MCO', value: 'SAF_SED' }
      ]).build()
      .getFields();

    // Étape 2 : Évaluation Fiabilité & MCO
    const step2 = this.formBuilderService
      .reset()
      .rating('criticalityRating', 'Niveau de Sévérité de Défaillance AMDEC (1 à 5)').required().half()
      .ratingConfig({ maxStars: 5 })
      .helpText('Évaluation de la criticité opérationnelle')
      .build()
      .color('lcnBadgeColor', 'Code Couleur Marquage Logistique').half()
      .defaultValue('#00205B')
      .build()
      .number('mtbfHours', 'MTBF Évalué (heures)').required().half().placeholder('ex: 1800').build()
      .number('mttrHours', 'MTTR Cible (heures)').required().half().placeholder('ex: 2.0').build()
      .tags('maintenanceTools', 'Bancs & Testeurs MCO').full()
      .tagConfig({ suggestions: ['Banc Optronique ATE', 'Testeur Bus 1553'] })
      .build()
      .getFields();

    // Étape 3 : Signature & Conformité S1000D
    const step3 = this.formBuilderService
      .reset()
      .password('signatureCode', 'Code d\'Approbation Ingénieur bobo').required().minLength(6).half().placeholder('••••••••').build()
      .password('signatureCodeConfirm', 'Confirmer le Code').required().matchField('signatureCode').half().placeholder('••••••••').build()
      .checkbox('acceptS1000DCharter', 'Valider la conformité aux spécifications S3000L / S1000D Soutien Logistique').required().full().build()
      .getFields();

    this.wizardSteps = [
      {
        id: 'step-bobo-lcn',
        label: '1. Article & LCN',
        description: 'Identification du composant Patroller',
        fields: step1
      },
      {
        id: 'step-bobo-amdec',
        label: '2. Fiabilité & MCO',
        description: 'AMDEC, MTBF et outillages de soutien',
        fields: step2
      },
      {
        id: 'step-bobo-signature',
        label: '3. Conformité S1000D',
        description: 'Approbation logistique et signature',
        fields: step3
      }
    ];
  }

  // Adapter function mapping raw boboPatrollerItemPayload into SbdDropdownOption
  public boboAdapter: SbdDropdownAdapter<boboPatrollerItemPayload> = (item) => {
    let badgeColor: 'blue' | 'cyan' | 'green' | 'amber' | 'purple' | 'red' = 'cyan';
    if (item.criticalityLevel === 'CRITICAL_A') badgeColor = 'red';
    if (item.criticalityLevel === 'HIGH_B') badgeColor = 'amber';

    return {
      id: item.lcnCode,
      label: `${item.lcnCode} — ${item.itemName}`,
      subLabel: `Catégorie: ${item.systemCategory} • MTBF: ${item.mtbfHours}h • Unité: ${item.leadUnit}`,
      badge: item.criticalityLevel,
      badgeColor,
      raw: item
    };
  };

  public fetchMockboboItems(): void {
    this.isApiLoading.set(true);
    setTimeout(() => {
      this.boboItems.set([
        {
          lcnCode: 'PATROL-OPT-410',
          itemName: 'Boule Optronique Euroflir 410 HD/IR/Laser',
          systemCategory: 'OPTICAL_PAYLOAD',
          criticalityLevel: 'CRITICAL_A',
          leadUnit: '61e Régiment d\'Artillerie',
          mtbfHours: 2500,
          mttrHours: 4.0,
          documentationRef: 'S1000D-SAF-PATROL-410-01',
          maintenanceTools: ['Banc Optronique ATE Villaroche', 'Calibreur Laser STANAG'],
          isOperationalMco: true
        },
        {
          lcnCode: 'PATROL-AVIO-FCC',
          itemName: 'Calculateur de Vol Avionique FCC Principal',
          systemCategory: 'AVIONICS_BUS',
          criticalityLevel: 'CRITICAL_A',
          leadUnit: 'Sbd Electronics & Defense',
          mtbfHours: 5000,
          mttrHours: 1.5,
          documentationRef: 'S1000D-SAF-PATROL-FCC-10',
          maintenanceTools: ['Valise Testeur Bus MIL-1553'],
          isOperationalMco: true
        },
        {
          lcnCode: 'PATROL-GCS-PILOT',
          itemName: 'Console Station de Contrôle Sol (GCS) Pilote',
          systemCategory: 'GROUND_CONTROL',
          criticalityLevel: 'CRITICAL_A',
          leadUnit: '61e RA / Armée de Terre',
          mtbfHours: 6500,
          mttrHours: 1.0,
          documentationRef: 'S1000D-SAF-PATROL-GCS-01',
          maintenanceTools: ['Banc Test STANAG 4586'],
          isOperationalMco: true
        }
      ]);
      this.isApiLoading.set(false);
      this.showToast('Base bobo Patroller actualisée !');
    }, 400);
  }

  public onboboItemSelectionChange(item: boboPatrollerItemPayload | null): void {
    this.selectedboboItem.set(item);
    if (item) {
      this.editingLcnCode.set(item.lcnCode);
      this.boboInitialData.set({ ...item });
      this.showToast(`Élément bobo chargé: ${item.lcnCode}`);
    } else {
      this.startCreateNewboboItem();
    }
  }

  public startCreateNewboboItem(): void {
    this.selectedboboItem.set(null);
    this.editingLcnCode.set(null);
    this.boboInitialData.set({
      lcnCode: `PATROL-NEW-0${this.boboItems().length + 1}`,
      itemName: '',
      systemCategory: 'OPTICAL_PAYLOAD',
      criticalityLevel: 'HIGH_B',
      leadUnit: '61RA',
      mtbfHours: 3000,
      mttrHours: 3.0,
      documentationRef: 'S1000D-SAF-PATROL-NEW',
      isOperationalMco: true
    });
    this.showToast('Nouveau composant bobo en cours de création.');
  }

  public onDropdownItemAction(event: SbdDropdownActionEvent<boboPatrollerItemPayload>): void {
    const raw = event.option.raw;
    if (event.action === 'view-details') {
      this.onboboItemSelectionChange(raw);
    } else if (event.action === 'pin') {
      this.showToast(`Élément bobo "${raw.lcnCode}" épinglé au MCO !`);
    }
  }

  public onboboFormSubmit(event: SbdFormSubmitEvent<any>): void {
    this.isFormSubmitting.set(true);
    setTimeout(() => {
      this.isFormSubmitting.set(false);
      const payload = event.value;

      if (event.mode === 'edit') {
        this.boboItems.update(list =>
          list.map(i => i.lcnCode === event.recordId ? { ...i, ...payload } : i)
        );
        this.selectedboboItem.set(payload);
        this.showToast(`Fiche bobo ${event.recordId} mise à jour avec succès !`);
      } else {
        this.boboItems.update(list => [payload, ...list]);
        this.selectedboboItem.set(payload);
        this.editingLcnCode.set(payload.lcnCode);
        this.showToast(`Nouveau composant LCN "${payload.lcnCode}" enregistré dans la bobo Patroller !`);
      }
    }, 600);
  }

  public onWizardSubmit(event: SbdWizardSubmitEvent): void {
    this.isWizardSubmitting.set(true);
    setTimeout(() => {
      this.isWizardSubmitting.set(false);
      this.wizardResultData.set(event.value);
      this.showToast('Analyse bobo validée & enregistrée en BDD !');
      console.log('[SbdDemoComponent] bobo Wizard payload:', event);
    }, 800);
  }

  public onFileNodeSelect(node: SbdTreeNode<boboPatrollerItemPayload>): void {
    this.selectedFileNode.set(node);
    const itemType = node.type === 'folder' ? 'Dossier' : 'Composant LCN';
    this.showToast(`${itemType} sélectionné: ${node.name}`);
  }

  public onFileNodeAction(event: SbdNodeActionEvent<boboPatrollerItemPayload>): void {
    this.showToast(`Action "${event.action.toUpperCase()}" sur: ${event.node.name}`);
  }

  /** Count total descendant files in a tree folder node */
  public countFolderFiles(node: SbdTreeNode<boboPatrollerItemPayload>): number {
    if (!node.children || node.children.length === 0) return 0;
    let count = 0;
    node.children.forEach(child => {
      if (child.type === 'file') count++;
      else if (child.type === 'folder') count += this.countFolderFiles(child);
    });
    return count;
  }

  public showToast(msg: string): void {
    this.toastMessage.set(msg);
    setTimeout(() => {
      if (this.toastMessage() === msg) {
        this.toastMessage.set(null);
      }
    }, 3200);
  }
}
