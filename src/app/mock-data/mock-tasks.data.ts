import { TaskCard } from '../models/task-card.model';

/**
 * ============================================================================
 * MOCK DATASET: Task Cards (Fiches de Tâches MTA)
 * ============================================================================
 * Tâches de maintenance S3000L alignées sur les LCN du projet M88.
 *
 * // TODO: [API BACKEND] Pour brancher votre vraie API :
 * // 1. GET /api/v1/projects/:projectId/task-cards
 * // 2. POST /api/v1/projects/:projectId/task-cards
 * // 3. PUT /api/v1/projects/:projectId/task-cards/:id
 */
export const MOCK_TASK_CARDS: TaskCard[] = [
  {
    id: 'tsk-001',
    taskNumber: 'TSK-E01-PRV-001',
    lcn: 'E01-01-01',
    title: 'Inspection Boroscopique des Aubes de Compresseur HP',
    type: 'Inspection',
    maintenanceLevel: 'O',
    frequency: 150,
    frequencyUnit: 'FH',
    mttr: 1.8,
    manHours: 3.6,
    resources: [
      { role: 'Technicien B1.3 Propulsion', count: 2, durationHours: 1.8 }
    ],
    requiredTools: ['GSE-BOROS-01 — Boroscope rigide ∅5mm', 'Éclairage LED endoscopique'],
    description: "Inspection visuelle indirecte par boroscope rigide de l'ensemble aubagé des 3 premiers étages du compresseur HP. Détecter érosion, écaillage et FOD.",
    safetyPrecautions: "Moteur hors énergie. Balisage DANGER moteur. Délai de refroidissement minimum 3 heures.",
    projectId: 'proj-m88-s3000l'
  },
  {
    id: 'tsk-002',
    taskNumber: 'TSK-E01-COR-002',
    lcn: 'E01-01-01',
    title: 'Remplacement Standard Aubes Compresseur HP — LOT',
    type: 'Corrective',
    maintenanceLevel: 'I',
    frequency: 1,
    frequencyUnit: 'On Condition',
    mttr: 8.5,
    manHours: 17.0,
    resources: [
      { role: 'Technicien B1.3 Propulsion', count: 2, durationHours: 8.5 }
    ],
    requiredTools: [
      'GSE-TOOL-09 — Banc de test propulsion',
      'Clé dynamométrique certifiée 0-50 Nm',
      'Extracteur d\'aubes dédié PN-PULL-44'
    ],
    description: "Dépose et repose du lot d'aubes sur détection de défaut boroscopique (cote hors tolérance ou FOD). Contrôle de couple de serrage obligatoire.",
    safetyPrecautions: "Port des EPI requis (gants anti-coupure, lunettes). Marquage TAG OUT de toutes les alimentations.",
    projectId: 'proj-m88-s3000l'
  },
  {
    id: 'tsk-003',
    taskNumber: 'TSK-E01-PRV-003',
    lcn: 'E01-02-01',
    title: 'Contrôle Fonctionnel et Test Étanchéité Bleed Valves',
    type: 'Preventive',
    maintenanceLevel: 'O',
    frequency: 300,
    frequencyUnit: 'FH',
    mttr: 2.0,
    manHours: 4.0,
    resources: [
      { role: 'Technicien B1.3 Propulsion', count: 2, durationHours: 2.0 }
    ],
    requiredTools: ['Banc de pression pneumatique portable', 'Détecteur de fuites mousse'],
    description: "Vérification de l'ouverture/fermeture des vannes de décharge compresseur HP à différentes pressions de consigne. Test d'étanchéité statique.",
    projectId: 'proj-m88-s3000l'
  },
  {
    id: 'tsk-004',
    taskNumber: 'TSK-E02-PRV-004',
    lcn: 'E02-01-01',
    title: 'Contrôle Débit et Étanchéité Gicleurs Carburant HP',
    type: 'Preventive',
    maintenanceLevel: 'I',
    frequency: 300,
    frequencyUnit: 'FH',
    mttr: 4.5,
    manHours: 9.0,
    resources: [
      { role: 'Technicien B1.3 Propulsion', count: 2, durationHours: 4.5 }
    ],
    requiredTools: ['Banc de calibrage injecteurs carburant', 'Fluide de test étalon'],
    description: "Dépose des 18 injecteurs HP pour contrôle individuel de débit et d'étanchéité sur banc calibré. Remplacement unitaire si hors tolérance ±2%.",
    projectId: 'proj-m88-s3000l'
  },
  {
    id: 'tsk-005',
    taskNumber: 'TSK-E02-PRV-005',
    lcn: 'E02-02-01',
    title: 'Contrôle Visuel Aubes Turbine HP par Boroscope',
    type: 'Inspection',
    maintenanceLevel: 'O',
    frequency: 300,
    frequencyUnit: 'FH',
    mttr: 2.5,
    manHours: 5.0,
    resources: [
      { role: 'Technicien B1.3 Propulsion', count: 2, durationHours: 2.5 }
    ],
    requiredTools: ['GSE-BOROS-02 — Boroscope flexible haute température', 'Enregistreur vidéo dédié'],
    description: "Inspection des 24 aubes monocristallines de la turbine HP. Contrôle des barrières thermiques EB-PVD, fissures de fatigue thermique et dépôts.",
    safetyPrecautions: "Délai de refroidissement minimum 6 heures après arrêt moteur.",
    projectId: 'proj-m88-s3000l'
  },
  {
    id: 'tsk-006',
    taskNumber: 'TSK-E03-PRV-006',
    lcn: 'E03-01',
    title: 'Téléchargement et Analyse Logs FADEC',
    type: 'Diagnostic',
    maintenanceLevel: 'O',
    frequency: 1,
    frequencyUnit: 'On Condition',
    mttr: 0.5,
    manHours: 1.0,
    resources: [
      { role: 'Technicien B2 Avionique', count: 1, durationHours: 1.0 }
    ],
    requiredTools: ['Tablette MRO avec logiciel FADEC Maintenance Tool (FMT)', 'Câble ARINC 664 dédié'],
    description: "Connexion au FADEC ECU via bus de maintenance. Téléchargement des logs de vol, NFF diagnostics et compteurs de vie. Analyse par outil FMT.",
    projectId: 'proj-m88-s3000l'
  },
  {
    id: 'tsk-007',
    taskNumber: 'TSK-E03-COR-007',
    lcn: 'E03-01',
    title: 'Échange Standard ECU FADEC (LRU)',
    type: 'Corrective',
    maintenanceLevel: 'O',
    frequency: 1,
    frequencyUnit: 'On Condition',
    mttr: 1.5,
    manHours: 3.0,
    resources: [
      { role: 'Technicien B2 Avionique', count: 1, durationHours: 1.5 },
      { role: 'Technicien B1.3 Propulsion', count: 1, durationHours: 1.5 }
    ],
    requiredTools: ['Tablette MRO — FMT', 'Outillage anti-statique ESD'],
    description: "Dépose/repose et remplacement standard de l'ECU FADEC actif ou de secours. Chargement du logiciel certifié et essai moteur de vérification.",
    safetyPrecautions: "Précautions ESD obligatoires. Interdiction de brancher/débrancher sous tension.",
    projectId: 'proj-m88-s3000l'
  },
];
