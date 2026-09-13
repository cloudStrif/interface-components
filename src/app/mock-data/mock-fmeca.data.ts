import { FmecaRecord } from '../models/fmeca.model';

/**
 * ============================================================================
 * MOCK DATASET: FMECA (Failure Mode, Effects & Criticality Analysis)
 * ============================================================================
 * Analyse AMDEC alignée sur les LCN du projet M88 (S3000L Issue 2.0).
 * Criticités selon MIL-STD-1629A.
 *
 * // TODO: [API BACKEND] Pour brancher votre vraie API :
 * // 1. GET /api/v1/projects/:projectId/fmeca
 * // 2. POST /api/v1/projects/:projectId/fmeca
 * // 3. PUT /api/v1/projects/:projectId/fmeca/:id
 */
export const MOCK_FMECA_RECORDS: FmecaRecord[] = [
  {
    id: 'fmeca-001',
    lcn: 'E01-01-01',
    itemName: 'Aubes de Compresseur HP',
    function: "Comprimer l'air admis vers la chambre de combustion à rapport de pression 7:1",
    failureMode: 'Érosion et écaillage de la surface portante',
    failureCause: 'Ingestion FOD (Foreign Object Damage) ou sable abrasif',
    localEffect: "Perte de profil aérodynamique de l'aube",
    systemEffect: "Réduction du taux de compression — EGT +8°C à +12°C",
    missionEffect: "Dégradation progressive de la poussée disponible. Pas de perte mission immédiate.",
    detectionMethod: 'Inspection boroscopique périodique (150 FH)',
    compensatingProvision: 'Surveillance EGT continue par FADEC — Alerte cockpit si dérive >15°C',
    severity: 'III',
    failureRate: 8.2,
    mtbf: 121951,
    projectId: 'proj-m88-s3000l'
  },
  {
    id: 'fmeca-002',
    lcn: 'E01-01-01',
    itemName: 'Aubes de Compresseur HP',
    function: "Comprimer l'air admis vers la chambre de combustion",
    failureMode: 'Rupture par fatigue vibratoire (flutter)',
    failureCause: "Résonance au régime de croisière. Endommagement de surface préexistant.",
    localEffect: "Arrachement d'aube — pénétration débris dans turbine HP",
    systemEffect: "Destruction du moteur par ingestion interne. Arrêt en vol.",
    missionEffect: "Perte du moteur. Mission compromise — procédure panne moteur.",
    detectionMethod: 'Capteurs vibratoires FADEC — Alarme automatique',
    compensatingProvision: 'Redondance moteur (biréacteur). Procédure panne moteur certifiée.',
    severity: 'I',
    failureRate: 0.08,
    mtbf: 12500000,
    projectId: 'proj-m88-s3000l'
  },
  {
    id: 'fmeca-003',
    lcn: 'E01-02-01',
    itemName: 'Vanne de Décharge Bleed HP',
    function: "Réguler la pression du compresseur HP pour éviter le pompage",
    failureMode: "Blocage en position fermée (panne passive)",
    failureCause: "Corrosion du mécanisme de commande pneumatique",
    localEffect: "Déséquilibre des pressions inter-étages compresseur",
    systemEffect: "Risque de pompage compresseur — vibrations anormales",
    missionEffect: "Limitation au régime partiel. Mission partiellement dégradée.",
    detectionMethod: 'FADEC — détection incohérence capteur position/pression',
    severity: 'II',
    failureRate: 2.1,
    mtbf: 476190,
    projectId: 'proj-m88-s3000l'
  },
  {
    id: 'fmeca-004',
    lcn: 'E01-02-01',
    itemName: 'Vanne de Décharge Bleed HP',
    function: "Réguler la pression du compresseur HP",
    failureMode: "Blocage en position ouverte (panne active)",
    failureCause: "Défaillance ressort de rappel ou joint pneumatique",
    localEffect: "Fuite d'air permanente du compresseur vers l'atmosphère",
    systemEffect: "Réduction de la poussée maximale disponible (-5 à -8%)",
    missionEffect: "Performance dégradée mais mission poursuivable.",
    detectionMethod: 'FADEC — incohérence poussée mesurée/calculée. EGT anormalement bas.',
    severity: 'III',
    failureRate: 3.5,
    mtbf: 285714,
    projectId: 'proj-m88-s3000l'
  },
  {
    id: 'fmeca-005',
    lcn: 'E02-01-01',
    itemName: 'Gicleur Carburant HP',
    function: "Injecter et nébuliser le carburant dans la chambre de combustion",
    failureMode: "Obstruction partielle du filtre ou de la buse",
    failureCause: "Contamination carburant ou dépôts calamineux",
    localEffect: "Déséquilibre de la répartition de carburant dans les 18 injecteurs",
    systemEffect: "Gradient thermique radial chambre de combustion — Hot Spot",
    missionEffect: "Dégradation durée de vie turbine HP. Mission poursuivable si <3 injecteurs affectés.",
    detectionMethod: 'Contrôle périodique débit banc calibrage (300 FH)',
    severity: 'II',
    failureRate: 5.0,
    mtbf: 200000,
    projectId: 'proj-m88-s3000l'
  },
  {
    id: 'fmeca-006',
    lcn: 'E02-02-01',
    itemName: 'Aube de Turbine HP Monocristalline',
    function: "Détendre les gaz brûlés pour extraire l'énergie et entraîner le compresseur HP",
    failureMode: "Fissuration de la barrière thermique EB-PVD",
    failureCause: "Fatigue thermique par cycles thermiques répétés et oxydation à haute température",
    localEffect: "Exposition du substrat métallique AM1 aux gaz >1600°C",
    systemEffect: "Surchauffe locale de l'aube — risque de défaillance structurelle",
    missionEffect: "Si non détecté, risque de rupture aube entraînant la perte du moteur.",
    detectionMethod: 'Boroscope flexible (300 FH) — mesure optique de la couche TBC',
    severity: 'I',
    failureRate: 1.5,
    mtbf: 666667,
    projectId: 'proj-m88-s3000l'
  },
  {
    id: 'fmeca-007',
    lcn: 'E03-01',
    itemName: 'ECU FADEC — Canal A ou B',
    function: "Calculer et réguler tous les paramètres moteur en temps réel",
    failureMode: "Panne d'un canal (A ou B) — basculement automatique",
    failureCause: "Défaillance composant électronique ou surtension transitoire",
    localEffect: "Perte d'un canal FADEC — mode dégradé sur canal survivant",
    systemEffect: "Fonctionnement en mode dégradé sans redondance. Limitations régime.",
    missionEffect: "Mission poursuivable. Maintenance obligatoire avant prochain vol.",
    detectionMethod: 'Auto-test FADEC au démarrage + BIT continu en vol. Alerte cockpit FADEC FAULT.',
    compensatingProvision: 'Architecture duale redondante A/B. Basculement automatique en <50ms.',
    severity: 'II',
    failureRate: 0.5,
    mtbf: 2000000,
    projectId: 'proj-m88-s3000l'
  },
  {
    id: 'fmeca-008',
    lcn: 'E03-01',
    itemName: 'ECU FADEC — Canaux A et B',
    function: "Calculer et réguler tous les paramètres moteur",
    failureMode: "Panne totale double canal (Common Cause Failure)",
    failureCause: "Surtension foudre ou état de rayonnement électromagnétique intense",
    localEffect: "Perte totale de la régulation numérique moteur",
    systemEffect: "Arrêt moteur en vol (Engine Flame Out). Prise de commande manuelle impossible.",
    missionEffect: "Perte du moteur. Procédure d'urgence. Mission perdue.",
    detectionMethod: "Alarme simultanée FADEC A + B au cockpit. Détection automatique.",
    compensatingProvision: "Protection EMC renforcée. Tests de compatibilité électromagnétique certifiés.",
    severity: 'I',
    failureRate: 0.005,
    mtbf: 200000000,
    projectId: 'proj-m88-s3000l'
  }
];
