import { SupportItem } from '../models/support-item.model';

/**
 * ============================================================================
 * MOCK DATASET: Support Items (Pièces de Rechange, Outillages & GSE)
 * ============================================================================
 * Articles de soutien logistique liés aux LCN du projet M88.
 *
 * // TODO: [API BACKEND] Pour brancher votre vraie API :
 * // 1. GET /api/v1/projects/:projectId/support-items
 * // 2. POST /api/v1/projects/:projectId/support-items
 * // 3. PUT /api/v1/projects/:projectId/support-items/:id
 */
export const MOCK_SUPPORT_ITEMS: SupportItem[] = [
  // ─── Spare Parts ────────────────────────────────────────────────────────────
  {
    id: 'sup-001',
    referenceNumber: 'KIT-SEAL-HP-04',
    name: 'Kit de Joints HP Compresseur — Set Complet',
    category: 'Spare Part',
    linkedLcns: ['E01-01', 'E01-02'],
    stockQuantity: 12,
    unitPrice: 2400,
    currency: 'EUR',
    supplier: 'AeroSeal Industries',
    description: 'Kit complet de joints torique et d\'étanchéité pour révision compresseur HP. Contient 48 pièces.',
    projectId: 'proj-m88-s3000l'
  },
  {
    id: 'sup-002',
    referenceNumber: 'PN-BLD-7812-LOT',
    name: 'Lot Aubes Compresseur HP — 28 pièces',
    category: 'Spare Part',
    linkedLcns: ['E01-01-01'],
    stockQuantity: 3,
    unitPrice: 117600,
    currency: 'EUR',
    supplier: 'TurboPropulsion SA',
    description: 'Lot complet d\'aubes de remplacement pour les étages 1 à 3 du compresseur HP. Certification airworthiness EASA jointe.',
    projectId: 'proj-m88-s3000l'
  },
  {
    id: 'sup-003',
    referenceNumber: 'PN-VLV-334-SPARE',
    name: 'Vanne de Décharge Bleed HP (de rechange)',
    category: 'Spare Part',
    linkedLcns: ['E01-02-01'],
    stockQuantity: 8,
    unitPrice: 8500,
    currency: 'EUR',
    supplier: 'HydroAero Components',
    description: 'Pièce de rechange LRU — échangeable standard en ligne. Livrée avec certificat de libération EASA Form 1.',
    projectId: 'proj-m88-s3000l'
  },
  {
    id: 'sup-004',
    referenceNumber: 'PN-ECU-9900X-SPARE',
    name: 'ECU FADEC — Unité de Rechange LRU',
    category: 'Spare Part',
    linkedLcns: ['E03-01'],
    stockQuantity: 2,
    unitPrice: 148000,
    currency: 'EUR',
    supplier: 'FullAuthority Digital Systems',
    description: 'Calculateur FADEC échangeable standard. Logiciel certifié pré-chargé v14.2. EASA Form 1 inclus.',
    projectId: 'proj-m88-s3000l'
  },
  // ─── Tools & GSE ────────────────────────────────────────────────────────────
  {
    id: 'sup-005',
    referenceNumber: 'GSE-BOROS-01',
    name: 'Boroscope Rigide — ∅5mm Haute Résolution',
    category: 'GSE',
    linkedLcns: ['E01-01-01', 'E01-02-01'],
    stockQuantity: 4,
    unitPrice: 18500,
    currency: 'EUR',
    supplier: 'OpticalMRO GmbH',
    description: 'Boroscope rigide ∅5mm avec enregistreur vidéo intégré 4K. Utilisé pour l\'inspection des aubes compresseur HP à chaque visite 150 FH.',
    calibrationRequired: true,
    calibrationFrequencyMonths: 12,
    projectId: 'proj-m88-s3000l'
  },
  {
    id: 'sup-006',
    referenceNumber: 'GSE-BOROS-02',
    name: 'Boroscope Flexible Haute Température — ∅8mm',
    category: 'GSE',
    linkedLcns: ['E02-02-01'],
    stockQuantity: 2,
    unitPrice: 32000,
    currency: 'EUR',
    supplier: 'OpticalMRO GmbH',
    description: 'Boroscope flexible résistant aux hautes températures pour inspection turbine HP et chambre de combustion.',
    calibrationRequired: true,
    calibrationFrequencyMonths: 12,
    projectId: 'proj-m88-s3000l'
  },
  {
    id: 'sup-007',
    referenceNumber: 'GSE-TOOL-09',
    name: 'Banc de Test et Diagnostic Propulsion',
    category: 'GSE',
    linkedLcns: ['E01-01-01', 'E02-01-01', 'E03-01'],
    stockQuantity: 1,
    unitPrice: 245000,
    currency: 'EUR',
    supplier: 'AeroBench Systems',
    description: 'Banc multi-usage pour test fonctionnel des sous-systèmes propulsion. Compatible FADEC, capteurs pression et vannes bleed.',
    calibrationRequired: true,
    calibrationFrequencyMonths: 6,
    projectId: 'proj-m88-s3000l'
  },
  {
    id: 'sup-008',
    referenceNumber: 'GSE-LIFT-22',
    name: 'Kit d\'Élingage et Berceau de Manutention Moteur',
    category: 'GSE',
    linkedLcns: ['E01-01', 'E02-00', 'E03-00'],
    stockQuantity: 2,
    unitPrice: 42000,
    currency: 'EUR',
    supplier: 'GroundTech Aviation',
    description: 'Berceau de manutention sécurisé pour dépose/repose moteur sur aéronef. CMU 1 200 kg. Compatible avec pont roulant 2T.',
    calibrationRequired: false,
    projectId: 'proj-m88-s3000l'
  },
  // ─── Technical Publications ──────────────────────────────────────────────────
  {
    id: 'sup-009',
    referenceNumber: 'AMM-M88-VOL1',
    name: 'Aircraft Maintenance Manual (AMM) — Volume 1 Propulsion',
    category: 'Technical Publication',
    linkedLcns: ['E01-00', 'E02-00', 'E03-00'],
    description: 'Manuel de maintenance aéronef couvrant l\'ensemble du système propulsion M88. Révision en vigueur : 2026-07. Format IETP S1000D.',
    projectId: 'proj-m88-s3000l'
  },
  {
    id: 'sup-010',
    referenceNumber: 'CMM-E03-FADEC',
    name: 'Component Maintenance Manual FADEC ECU',
    category: 'Technical Publication',
    linkedLcns: ['E03-01'],
    description: 'CMM du calculateur FADEC. Procédures de test, dépose/repose, chargement logiciel. Accès constructeur restreint.',
    projectId: 'proj-m88-s3000l'
  },
  // ─── Training ────────────────────────────────────────────────────────────────
  {
    id: 'sup-011',
    referenceNumber: 'TRN-B1-PROP',
    name: 'Formation B1.3 Propulsion Turbofan — Module M88',
    category: 'Training',
    linkedLcns: ['E01-00', 'E02-00'],
    supplier: 'AeroTraining Academy',
    description: 'Formation pratique et théorique de 5 jours pour techniciens B1.3. Habilitation pour tous travaux en ligne sur le M88.',
    projectId: 'proj-m88-s3000l'
  }
];
