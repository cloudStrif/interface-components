import { Injectable, signal, computed } from '@angular/core';
import { Project, S3000LVersion } from '../models/project.model';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private initialProjects: Project[] = [
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

  public projects = signal<Project[]>(this.initialProjects);
  public activeProjectId = signal<string>(this.initialProjects[0].id);

  public activeProject = computed(() => {
    const list = this.projects();
    const activeId = this.activeProjectId();
    return list.find(p => p.id === activeId) || list[0];
  });

  public selectProject(id: string): void {
    if (this.projects().some(p => p.id === id)) {
      this.activeProjectId.set(id);
    }
  }

  public createProject(name: string, s3000lVersion: S3000LVersion, description?: string): Project {
    const newProj: Project = {
      id: `proj-${Date.now().toString(36)}`,
      name: name.trim(),
      s3000lVersion: s3000lVersion,
      createdAt: new Date(),
      updatedAt: new Date(),
      description: description?.trim() || `Projet S3000L version ${s3000lVersion}`,
      nodeCount: 0
    };

    this.projects.update(list => [newProj, ...list]);
    this.activeProjectId.set(newProj.id);
    return newProj;
  }
}
