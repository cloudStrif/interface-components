import { SbdOrgTreeNode } from '../models/org-chart.model';

/**
 * Jeu de données hiérarchiques Mock pour Optimus UI OrganizationChart.
 * Architecture industrielle S3000L / Aéronautique d'un aéronef complexe.
 * IMPORTANT: Chaque nœud est initialisé avec `expanded: false`
 * afin que l'arbre ne prenne pas d'espace au départ et affiche uniquement la racine.
 */
export const MOCK_ORGANIZATION_CHART_DATA: SbdOrgTreeNode[] = [
  {
    key: 'ROOT-001',
    label: 'Aéronef Polyvalent M88-S3000L',
    type: 'root',
    expanded: false,
    data: {
      id: 'SYS-AERO-01',
      code: 'PBS-00-ROOT',
      title: 'Aéronef Polyvalent M88-S3000L',
      category: 'Système Global',
      department: 'Direction Programme Aéronautique',
      manager: 'Ing. Gén. Jean Dupont',
      status: 'active',
      description: 'Plateforme aéroportée supersonique multimission conforme aux spécifications S3000L Issue 2.',
      stats: {
        componentsCount: 1420,
        tasksCount: 380,
        reliabilityRate: '99.4%',
        mtbfHours: 4500
      },
      themeColor: 'indigo',
      tags: ['S3000L', 'Root System', 'M88']
    },
    children: [
      // ==========================================
      // BRANCHE 1 : PROPULSION & TURBOMACHINE
      // ==========================================
      {
        key: 'SYS-PROP-01',
        label: 'Propulsion & Turbomachine',
        type: 'system',
        expanded: false,
        data: {
          id: 'SYS-PROP-01',
          code: 'ATA-72-PROP',
          title: 'Propulsion & Turbomachine M88',
          category: 'Groupe Motopropulseur',
          department: 'Direction Moteurs & Énergie',
          manager: 'Dr. Valérie Martin',
          status: 'active',
          description: 'Turboréacteur double corps à double flux avec post-combustion développant 75 kN de poussée.',
          stats: {
            componentsCount: 420,
            tasksCount: 112,
            reliabilityRate: '99.2%',
            mtbfHours: 2800
          },
          themeColor: 'blue',
          tags: ['ATA 72', 'M88-2', 'Poussée 75kN']
        },
        children: [
          {
            key: 'SUBSYS-COMP-BP',
            label: 'Compresseur Basse Pression (BP)',
            type: 'subsystem',
            expanded: false,
            data: {
              id: 'SUBSYS-COMP-BP',
              code: '72-10-COMP-BP',
              title: 'Compresseur Basse Pression (BP)',
              category: 'Sous-système Aérodynamique',
              department: 'Pôle Turbomachines',
              manager: 'Luc Bernard',
              status: 'active',
              description: 'Étage compresseur 3 étages basse pression en alliage titane à aubage usiné dans la masse (BLISK).',
              stats: {
                componentsCount: 84,
                tasksCount: 24,
                reliabilityRate: '99.7%',
                mtbfHours: 3500
              },
              themeColor: 'emerald',
              tags: ['Titane Blisk', 'Basse Pression']
            },
            children: [
              {
                key: 'ASSY-BLISK-BP-1',
                label: 'Aubage Monobloc 1er Étage (BLISK-1)',
                type: 'assembly',
                expanded: false,
                data: {
                  id: 'ASSY-BLISK-BP-1',
                  code: '72-10-101',
                  title: 'Disque Aubagé Monobloc Étage 1',
                  category: 'Assemblage Rotatif',
                  manager: 'Patrick Leroux',
                  status: 'active',
                  description: 'Disque et aubes forgés d’une seule pièce en Ti-6Al-4V haute tenue centrifuge.',
                  stats: {
                    componentsCount: 18,
                    tasksCount: 6,
                    reliabilityRate: '99.9%',
                    mtbfHours: 6000
                  },
                  themeColor: 'amber',
                  tags: ['Ti-6Al-4V', 'LRU']
                },
                children: [
                  {
                    key: 'COMP-AUBE-TI-01',
                    label: 'Aube Titane Profilée Étage 1',
                    type: 'component',
                    expanded: false,
                    data: {
                      id: 'COMP-AUBE-TI-01',
                      code: 'PN-BLD-7210-A1',
                      title: 'Aube Profilée Étage 1 (P/N: M88-A1-TI)',
                      category: 'Pièce Élémentaire',
                      status: 'active',
                      description: 'Profil aérodynamique supercritique à traitement de surface anti-érosion par impact.',
                      stats: { mtbfHours: 8000 },
                      themeColor: 'violet',
                      tags: ['SRU', 'P/N: M88-A1-TI']
                    }
                  },
                  {
                    key: 'COMP-CAPTEUR-VIB-01',
                    label: 'Capteur Accélérométrique Vibratoire',
                    type: 'component',
                    expanded: false,
                    data: {
                      id: 'COMP-CAPTEUR-VIB-01',
                      code: 'PN-SEN-VIB-88',
                      title: 'Accéléromètre Haute Température (+650°C)',
                      category: 'Instrumentation',
                      status: 'active',
                      description: 'Capteur piézo-électrique pour le monitoring temps réel de balourd compresseur.',
                      stats: { mtbfHours: 12000 },
                      themeColor: 'violet',
                      tags: ['HUMS', 'Piézo']
                    }
                  }
                ]
              },
              {
                key: 'ASSY-CARTER-BP',
                label: 'Carter Extérieur & Aubes Fixes (Stators)',
                type: 'assembly',
                expanded: false,
                data: {
                  id: 'ASSY-CARTER-BP',
                  code: '72-10-102',
                  title: 'Carter Structural BP et Redresseurs',
                  category: 'Assemblage Fixe',
                  status: 'active',
                  description: 'Structure statorique assurant le guidage du flux et la rigidité mécanique amont.',
                  themeColor: 'amber',
                  tags: ['Stator', 'Carter']
                }
              }
            ]
          },
          {
            key: 'SUBSYS-CHAMBRE-COMB',
            label: 'Chambre de Combustion & FADEC',
            type: 'subsystem',
            expanded: false,
            data: {
              id: 'SUBSYS-CHAMBRE-COMB',
              code: '72-20-COMB',
              title: 'Chambre Annulaire Haute Température & Injection',
              category: 'Génération Thermique',
              department: 'Pôle Combustion & Régulation',
              manager: 'Chantal Roussel',
              status: 'active',
              description: 'Chambre de combustion à faibles émissions polluantes et contrôle numérique pleine autorité (FADEC).',
              stats: {
                componentsCount: 96,
                tasksCount: 30,
                reliabilityRate: '99.5%',
                mtbfHours: 3200
              },
              themeColor: 'emerald',
              tags: ['1850 K', 'FADEC Dual Channel']
            },
            children: [
              {
                key: 'ASSY-INJECTEURS-RAMPE',
                label: 'Rampe d’Injection Double Circuit & Injecteurs',
                type: 'assembly',
                expanded: false,
                data: {
                  id: 'ASSY-INJECTEURS-RAMPE',
                  code: '72-20-201',
                  title: 'Rampe d’Alimentation et 16 Injecteurs Aéromécaniques',
                  category: 'Carburation',
                  status: 'active',
                  description: 'Vaporisation optimale du kérosène Jet A-1 avec injection étagée pilote et principale.',
                  themeColor: 'amber',
                  tags: ['16 Injecteurs', 'Jet A-1']
                }
              },
              {
                key: 'ASSY-CALC-FADEC',
                label: 'Calculateur Numérique FADEC Dual Redondant',
                type: 'assembly',
                expanded: false,
                data: {
                  id: 'ASSY-CALC-FADEC',
                  code: '73-20-FADEC',
                  title: 'Calculateur de Régulation Moteur FADEC',
                  category: 'Électronique Critique',
                  status: 'active',
                  description: 'Architecture bi-canal tolérante aux pannes avec basculement automatique sans à-coup.',
                  stats: {
                    componentsCount: 32,
                    tasksCount: 14,
                    reliabilityRate: '99.99%',
                    mtbfHours: 15000
                  },
                  themeColor: 'amber',
                  tags: ['DO-178C DAL A', 'Dual Channel']
                }
              }
            ]
          },
          {
            key: 'SUBSYS-TURB-HP',
            label: 'Turbine Haute Pression Monocristalline',
            type: 'subsystem',
            expanded: false,
            data: {
              id: 'SUBSYS-TURB-HP',
              code: '72-30-TURB-HP',
              title: 'Turbine HP et Aubes Monocristallines Refroidies',
              category: 'Expansion Thermique',
              status: 'maintenance',
              description: 'Turbine entraînant le compresseur HP avec aubes à barrière thermique en zircone et perçages laser.',
              stats: {
                componentsCount: 76,
                tasksCount: 22,
                reliabilityRate: '98.9%',
                mtbfHours: 2400
              },
              themeColor: 'emerald',
              tags: ['Barrière Thermique', 'Zircone']
            }
          }
        ]
      },

      // ==========================================
      // BRANCHE 2 : AVIONIQUE & NAVIGATION
      // ==========================================
      {
        key: 'SYS-AVIO-01',
        label: 'Avionique, Radar & Navigation',
        type: 'system',
        expanded: false,
        data: {
          id: 'SYS-AVIO-01',
          code: 'ATA-34-AVIO',
          title: 'Système Avionique & Conduite de Tir',
          category: 'Électronique & Senseurs',
          department: 'Direction Systèmes Embarqués',
          manager: 'Alexandre Moreau',
          status: 'active',
          description: 'Ensemble cohérent de calculateurs de mission, fusion multi-capteurs, radar à balayage électronique et guerre électronique.',
          stats: {
            componentsCount: 380,
            tasksCount: 95,
            reliabilityRate: '99.6%',
            mtbfHours: 4200
          },
          themeColor: 'blue',
          tags: ['ATA 34', 'AESA Radar', 'SPECTRA EW']
        },
        children: [
          {
            key: 'SUBSYS-RADAR-AESA',
            label: 'Radar à Balayage Électronique Actif (AESA)',
            type: 'subsystem',
            expanded: false,
            data: {
              id: 'SUBSYS-RADAR-AESA',
              code: '34-40-RBE2',
              title: 'Radar RBE2-AESA Multirôle',
              category: 'Senseur Frontal',
              status: 'active',
              description: 'Antenne active constituée de 1000+ modules émetteurs-récepteurs GaAs/GaN à agilité de fréquence ultra-rapide.',
              stats: {
                componentsCount: 110,
                tasksCount: 28,
                reliabilityRate: '99.5%',
                mtbfHours: 3800
              },
              themeColor: 'emerald',
              tags: ['GaN Transceivers', 'Poursuite Multiple']
            },
            children: [
              {
                key: 'ASSY-ANTENNE-AESA',
                label: 'Panneau Rayonnant & Modules T/R GaN',
                type: 'assembly',
                expanded: false,
                data: {
                  id: 'ASSY-ANTENNE-AESA',
                  code: '34-40-101',
                  title: 'Réseau Plan d’Antennes T/R Haute Puissance',
                  category: 'Hyperfréquences',
                  status: 'active',
                  description: 'Matrice de transmission RF refroidie par fluide diélectrique caloporteur.',
                  themeColor: 'amber',
                  tags: ['GaN', 'RF Array']
                }
              },
              {
                key: 'ASSY-TRAITEMENT-RADAR',
                label: 'Processeur Numérique de Signal Radar',
                type: 'assembly',
                expanded: false,
                data: {
                  id: 'ASSY-TRAITEMENT-RADAR',
                  code: '34-40-102',
                  title: 'Processeur DSP Temps Réel 64 Coeurs',
                  category: 'Calcul Numérique',
                  status: 'active',
                  description: 'Filtrage doppler, élimination fouillis de sol et cartographie SAR haute résolution.',
                  themeColor: 'amber',
                  tags: ['DSP 64 Cores', 'SAR Imaging']
                }
              }
            ]
          },
          {
            key: 'SUBSYS-NAV-INERT',
            label: 'Centrale Inertielle Laser & GPS Résilient',
            type: 'subsystem',
            expanded: false,
            data: {
              id: 'SUBSYS-NAV-INERT',
              code: '34-10-SIGMA',
              title: 'Centrale de Navigation Inertielle Hybride SIGMA 95',
              category: 'Navigation Précise',
              status: 'active',
              description: 'Gyrolasers à cavité optique haute précision couplés à un récepteur GNSS durci anti-brouillage (SAASM).',
              stats: {
                componentsCount: 45,
                tasksCount: 12,
                reliabilityRate: '99.9%',
                mtbfHours: 8500
              },
              themeColor: 'emerald',
              tags: ['Gyrolaser', 'Anti-Brouillage']
            }
          },
          {
            key: 'SUBSYS-COCKPIT-HUD',
            label: 'Cockpit Tout Écran & Collimateur Tête Haute',
            type: 'subsystem',
            expanded: false,
            data: {
              id: 'SUBSYS-COCKPIT-HUD',
              code: '31-20-HUD',
              title: 'Visualisation Tête Haute Holographique & Écrans Tactiles',
              category: 'Interface Homme-Machine',
              status: 'active',
              description: 'Grand collimateur holographique grand champ avec visée nocturne et écrans latéraux multifonctions (MFD).',
              themeColor: 'emerald',
              tags: ['HUD Holographique', 'IHM Tactile']
            }
          }
        ]
      },

      // ==========================================
      // BRANCHE 3 : COMMANDES DE VOL & HYDRAULIQUE
      // ==========================================
      {
        key: 'SYS-FCS-01',
        label: 'Commandes de Vol Électriques & Hydraulique',
        type: 'system',
        expanded: false,
        data: {
          id: 'SYS-FCS-01',
          code: 'ATA-27-FCS',
          title: 'Système Commandes de Vol Électriques (Fly-by-Wire)',
          category: 'Pilotage & Servocommandes',
          department: 'Direction Dynamique du Vol',
          manager: 'Sophie Guérin',
          status: 'active',
          description: 'Système quadruplex numérique garantissant la stabilité naturelle de l’avion instable en subsonique et supersonique.',
          stats: {
            componentsCount: 290,
            tasksCount: 88,
            reliabilityRate: '99.999%',
            mtbfHours: 12000
          },
          themeColor: 'blue',
          tags: ['Fly-by-Wire', 'Quadruplex', '350 bar']
        },
        children: [
          {
            key: 'SUBSYS-HYD-GEN',
            label: 'Centrale Génération Hydraulique 350 bar',
            type: 'subsystem',
            expanded: false,
            data: {
              id: 'SUBSYS-HYD-GEN',
              code: '29-10-HYD',
              title: 'Circuits Hydrauliques Double Circuit Indépendant',
              category: 'Puissance Fluidique',
              status: 'active',
              description: 'Deux circuits primaires A et B pressurisés à 350 bar par pompes entraînées sur relais d’accessoires moteur.',
              themeColor: 'emerald',
              tags: ['Circuit A & B', '350 bar']
            },
            children: [
              {
                key: 'ASSY-POMPE-350',
                label: 'Pompe Hydraulique Volumétrique à Pistons',
                type: 'assembly',
                expanded: false,
                data: {
                  id: 'ASSY-POMPE-350',
                  code: '29-10-PMP1',
                  title: 'Pompe à Cylindrée Variable 350 bar',
                  category: 'Organe de Puissance',
                  status: 'active',
                  themeColor: 'amber',
                  tags: ['350 bar', 'Pistons Axiaux']
                }
              }
            ]
          },
          {
            key: 'SUBSYS-SERVO-AILERON',
            label: 'Actionneurs Électro-Hydrauliques d’Ailerons',
            type: 'subsystem',
            expanded: false,
            data: {
              id: 'SUBSYS-SERVO-AILERON',
              code: '27-10-EHA',
              title: 'Servocommandes Électro-Hydrauliques Élevons',
              category: 'Actionnement Surface',
              status: 'active',
              description: 'Vérins tandem à double tiroir de servovalve pour le braquage rapide des gouvernes delta.',
              themeColor: 'emerald',
              tags: ['Élevons', 'Tandem']
            }
          }
        ]
      },

      // ==========================================
      // BRANCHE 4 : TRAIN D'ATTERRISSAGE
      // ==========================================
      {
        key: 'SYS-LANDING-01',
        label: 'Train d’Atterrissage & Système de Freinage',
        type: 'system',
        expanded: false,
        data: {
          id: 'SYS-LANDING-01',
          code: 'ATA-32-LG',
          title: 'Train Principal, Train Avant & Freinage Carbone',
          category: 'Structure & Roulage',
          department: 'Direction Atterrisseurs',
          manager: 'Henri Vasseur',
          status: 'planned',
          description: 'Atterrisseurs haute résistance pour appontage et pistes sommaires, freins carbone avec régulation anti-skid.',
          stats: {
            componentsCount: 165,
            tasksCount: 46,
            reliabilityRate: '99.4%',
            mtbfHours: 3600
          },
          themeColor: 'blue',
          tags: ['ATA 32', 'Anti-skid', 'Freins Carbone']
        },
        children: [
          {
            key: 'SUBSYS-MAIN-GEAR',
            label: 'Jambes d’Atterrisseur Principal Droite/Gauche',
            type: 'subsystem',
            expanded: false,
            data: {
              id: 'SUBSYS-MAIN-GEAR',
              code: '32-10-MLG',
              title: 'Jambe Télescopique Oléo-Pneumatique Principale',
              category: 'Absorption d’Énergie',
              status: 'active',
              description: 'Amortisseur oléopneumatique à double chambre pour absorption des taux de chute élevés.',
              themeColor: 'emerald',
              tags: ['Oléo-pneumatique', 'High Sink Rate']
            }
          },
          {
            key: 'SUBSYS-BRAKE-CARBON',
            label: 'Freins Carbone-Carbone & Système Anti-Patinage',
            type: 'subsystem',
            expanded: false,
            data: {
              id: 'SUBSYS-BRAKE-CARBON',
              code: '32-40-BRK',
              title: 'Disques de Frein Carbone & Calculateur Anti-Skid',
              category: 'Freinage Aéronautique',
              status: 'active',
              description: 'Empilement de disques carbone à coefficient de friction stable jusqu’à 1200°C et régulation numérique de glissement.',
              themeColor: 'emerald',
              tags: ['1200°C', 'Carbone-Carbone']
            }
          }
        ]
      },

      // ==========================================
      // BRANCHE 5 : STRUCTURE & CELLULE
      // ==========================================
      {
        key: 'SYS-STRUCT-01',
        label: 'Structure Primaire, Voilure & Cellule',
        type: 'system',
        expanded: false,
        data: {
          id: 'SYS-STRUCT-01',
          code: 'ATA-53-STRUCT',
          title: 'Cellule Fuselage, Voilure Composite & Dérive',
          category: 'Aérostructure',
          department: 'Direction Matériaux & Structures',
          manager: 'Élodie Caron',
          status: 'active',
          description: 'Structure allégée composite fibres de carbone / bismaléimide (BMI) et alliages titane-aluminium usinés haute précision.',
          stats: {
            componentsCount: 165,
            tasksCount: 38,
            reliabilityRate: '99.8%',
            mtbfHours: 18000
          },
          themeColor: 'blue',
          tags: ['ATA 53', 'Composites BMI', 'Titane']
        },
        children: [
          {
            key: 'SUBSYS-WING-DELTA',
            label: 'Voilure Delta & Réservoirs Structuraux',
            type: 'subsystem',
            expanded: false,
            data: {
              id: 'SUBSYS-WING-DELTA',
              code: '57-10-WING',
              title: 'Voilure Delta Monobloc en Fibre de Carbone',
              category: 'Aérodynamique & Capacité Carburant',
              status: 'active',
              description: 'Panneaux de voilure monoblocs en composite carbone résistant aux facteurs de charge +9g/-3.2g.',
              themeColor: 'emerald',
              tags: ['+9g / -3.2g', 'Réservoir Intégré']
            }
          },
          {
            key: 'SUBSYS-FUSELAGE-AVANT',
            label: 'Fuselage Avant, Baie Radar & Verrière Furtive',
            type: 'subsystem',
            expanded: false,
            data: {
              id: 'SUBSYS-FUSELAGE-AVANT',
              code: '53-10-FUS-AV',
              title: 'Fuselage Avant et Verrière Traitée Or Indium',
              category: 'Furtivité & Habitacle',
              status: 'active',
              description: 'Verrière traitée pour réduire la signature radar équivalente (SER) et cockpit pressurisé étanche.',
              themeColor: 'emerald',
              tags: ['Faible SER', 'Traitement Or']
            }
          }
        ]
      }
    ]
  }
];

/**
 * Fonction utilitaire qui renvoie une copie profonde fraîche du JSON mock
 * avec TOUS les nœuds garantis à `expanded: false`.
 */
export function getFreshMockOrganizationChartData(): SbdOrgTreeNode[] {
  const clone = JSON.parse(JSON.stringify(MOCK_ORGANIZATION_CHART_DATA));
  
  function setExpandedFalse(nodes: SbdOrgTreeNode[]): void {
    if (!nodes || !nodes.length) return;
    for (const node of nodes) {
      node.expanded = false;
      if (node.children && node.children.length) {
        setExpandedFalse(node.children);
      }
    }
  }

  setExpandedFalse(clone);
  return clone;
}
