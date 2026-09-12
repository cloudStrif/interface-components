import { Project } from '../models/project.model';

/**
 * ============================================================================
 * MOCK DATASET: Projets S3000L
 * ============================================================================
 * Modifiez facilement cette liste pour personnaliser les projets affichés en démo client.
 * 
 * // TODO: [API BACKEND] Pour brancher votre vraie API :
 * // 1. Injecter HttpClient dans ProjectService (private http = inject(HttpClient))
 * // 2. Appeler GET /api/v1/projects pour charger cette liste
 * // 3. Appeler POST /api/v1/projects pour persister un nouveau projet
 * // 4. Appeler DELETE /api/v1/projects/:id pour supprimer
 */
export const MOCK_PROJECTS: Project[] = [
  {
    id: 'proj-m88-s3000l',
    name: 'Projet M88 - Turboréacteur Militaire',
    s3000lVersion: '2.0',
    createdAt: new Date('2026-01-15'),
    updatedAt: new Date('2026-09-10'),
    description: 'Structure de découpage arborescente S3000L Issue 2.0 pour la gestion du système de propulsion.',
    nodeCount: 142,
    isDefault: true
  },
  {
    id: 'proj-gear-11',
    name: 'Système d\'Atterrisseur Principal (Main Gear)',
    s3000lVersion: '1.1',
    createdAt: new Date('2025-11-20'),
    updatedAt: new Date('2026-08-04'),
    description: 'Base de données SL révisée sous spécification S3000L Issue 1.1 pour les trains d\'atterrissage.',
    nodeCount: 86
  },
  {
    id: 'proj-avionics-20',
    name: 'Calculateurs & Avionique de Navigation',
    s3000lVersion: '2.0',
    createdAt: new Date('2026-03-01'),
    updatedAt: new Date('2026-09-01'),
    description: 'Découpage fonctionnel LSA des calculateurs de bord et des bus multiplexés.',
    nodeCount: 64
  }
];
