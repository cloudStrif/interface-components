import { Injectable, signal, computed } from '@angular/core';
import { Project, S3000LVersion } from '../models/project.model';
import { MOCK_PROJECTS } from '../mock-data/mock-projects.data';

/**
 * ============================================================================
 * ProjectService (Service de gestion des Projets S3000L)
 * ============================================================================
 * Gère la liste des projets et le projet actif via des Signals Angular réactifs.
 * 
 * // TODO: [INTÉGRATION BACKEND / API REST]
 * // Pour brancher votre backend en production :
 * // 1. Injecter HttpClient : private http = inject(HttpClient);
 * // 2. Remplacer le signal initial par un appel GET :
 * //    this.http.get<Project[]>('/api/v1/projects').subscribe(projs => this.projects.set(projs));
 * // 3. Remplacer createProject() par un appel POST :
 * //    this.http.post<Project>('/api/v1/projects', payload)...
 */
@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  // Signal réactif contenant les projets (initialisé avec le mock)
  public projects = signal<Project[]>(MOCK_PROJECTS);
  
  // Signal réactif pour le projet actif sélectionné
  public activeProjectId = signal<string>(MOCK_PROJECTS[0].id);

  // Computed signal calculant automatiquement l'objet projet actif
  public activeProject = computed(() => {
    const list = this.projects();
    const activeId = this.activeProjectId();
    return list.find(p => p.id === activeId) || list[0];
  });

  /**
   * Sélectionner un projet actif
   */
  public selectProject(id: string): void {
    if (this.projects().some(p => p.id === id)) {
      this.activeProjectId.set(id);
    }
  }

  /**
   * Créer un nouveau projet
   * // TODO: Remplacer par un appel HTTP réel :
   * // return this.http.post<Project>('/api/v1/projects', { name, s3000lVersion, description })
   */
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

    // Mise à jour réactive du Signal
    this.projects.update(list => [newProj, ...list]);
    this.activeProjectId.set(newProj.id);
    return newProj;
  }
}
