import { LoraRecord } from '../models/lora.model';

/**
 * ============================================================================
 * MOCK DATASET: LORA (Level of Repair Analysis)
 * ============================================================================
 * Analyse de niveau de réparation pour les LCI du projet M88.
 *
 * // TODO: [API BACKEND] Pour brancher votre vraie API :
 * // 1. GET /api/v1/projects/:projectId/lora
 * // 2. POST /api/v1/projects/:projectId/lora
 * // 3. PUT /api/v1/projects/:projectId/lora/:id
 */
export const MOCK_LORA_RECORDS: LoraRecord[] = [
  {
    id: 'lora-001',
    lcn: 'E01-01',
    itemName: 'Rotor de Compresseur HP',
    partNumber: 'PN-HP-ROT-409',
    recommendedLevel: 'D',
    decision: 'Repair',
    repairCostO: undefined,
    repairCostI: undefined,
    repairCostD: 45000,
    acquisitionCost: 285000,
    tatO: undefined,
    tatI: undefined,
    tatD: 120,
    justification: 'Réparation uniquement en dépôt industriel agréé. Coût de réparation D-Level représente 16% du coût neuf. Économie justifiée pour un composant à longue durée de vie.',
    projectId: 'proj-m88-s3000l'
  },
  {
    id: 'lora-002',
    lcn: 'E01-01-01',
    itemName: 'Aubes de Compresseur HP (lot 28)',
    partNumber: 'PN-BLD-7812',
    recommendedLevel: 'I',
    decision: 'Repair',
    repairCostO: undefined,
    repairCostI: 18000,
    repairCostD: 26000,
    acquisitionCost: 117600,
    tatO: undefined,
    tatI: 21,
    tatD: 60,
    justification: 'Réparation I-Level économiquement optimale : coût de réparation atelier 15% vs neuf. TAT de 21 jours acceptable pour le soutien opérationnel.',
    projectId: 'proj-m88-s3000l'
  },
  {
    id: 'lora-003',
    lcn: 'E01-01-02',
    itemName: 'Disque de Rotor Principal',
    partNumber: 'PN-DSC-9901',
    recommendedLevel: 'Discard',
    decision: 'Discard',
    acquisitionCost: 95000,
    justification: 'Composant à durée de vie limite (12 000 FC). Non réparable — destruction certifiée requise après atteinte de la limite. Remplacement neuf obligatoire.',
    projectId: 'proj-m88-s3000l'
  },
  {
    id: 'lora-004',
    lcn: 'E01-02-01',
    itemName: 'Vanne de Décharge Bleed HP',
    partNumber: 'PN-VLV-334',
    recommendedLevel: 'O',
    decision: 'Repair',
    repairCostO: 1200,
    repairCostI: 2800,
    repairCostD: 4500,
    acquisitionCost: 8500,
    tatO: 4,
    tatI: 14,
    tatD: 45,
    justification: 'LRU — échangeable standard en ligne (O-Level). Kit de réparation O-Level disponible. Coût 1 200€ vs 8 500€ neuf. TAT 4 jours minimal.',
    projectId: 'proj-m88-s3000l'
  },
  {
    id: 'lora-005',
    lcn: 'E02-01-01',
    itemName: 'Gicleur Carburant HP (unitaire)',
    partNumber: 'PN-NOZ-011',
    recommendedLevel: 'Discard',
    decision: 'Discard',
    acquisitionCost: 1850,
    justification: 'Économiquement non rentable à réparer. Faible coût unitaire, disponibilité immédiate, et risque de qualité à la réparation. Rebut systématique après 300 FH.',
    projectId: 'proj-m88-s3000l'
  },
  {
    id: 'lora-006',
    lcn: 'E02-02-01',
    itemName: 'Aube de Turbine HP Monocristalline',
    partNumber: 'PN-BLD-MONO-09',
    recommendedLevel: 'D',
    decision: 'Repair',
    repairCostD: 8500,
    acquisitionCost: 22500,
    tatD: 240,
    justification: 'Réparation D-Level : rechargement TBC et vérification cristallographique. Coût réparation 38% du neuf. TAT 240 jours — stock de rotation requis (pooling).',
    projectId: 'proj-m88-s3000l'
  },
  {
    id: 'lora-007',
    lcn: 'E03-01',
    itemName: 'ECU FADEC (LRU)',
    partNumber: 'PN-ECU-9900X',
    recommendedLevel: 'O',
    decision: 'Return to Supplier',
    repairCostO: 0,
    acquisitionCost: 148000,
    tatO: 1,
    tatI: 30,
    justification: 'Échange standard O-Level immédiat (TAT 1 jour). Réparation confiée exclusivement au fabricant (propriété logicielle). Contrat de support constructeur actif.',
    projectId: 'proj-m88-s3000l'
  }
];
