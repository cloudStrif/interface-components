import { Injectable, signal, computed, inject } from '@angular/core';
import { TaskCard } from '../models/task-card.model';
import { MOCK_TASK_CARDS } from '../mock-data/mock-tasks.data';
import { ProjectService } from './project.service';

/**
 * ============================================================================
 * TaskCardsService — Gestion des Fiches de Tâches (MTA)
 * ============================================================================
 * Expose les Task Cards via des Signals Angular réactifs.
 *
 * // TODO: [INTÉGRATION BACKEND / API REST]
 * // 1. GET /api/v1/projects/:projectId/task-cards
 * // 2. POST /api/v1/projects/:projectId/task-cards
 * // 3. PUT /api/v1/projects/:projectId/task-cards/:id
 */
@Injectable({ providedIn: 'root' })
export class TaskCardsService {
  private projectService = inject(ProjectService);

  private allCards = signal<TaskCard[]>(MOCK_TASK_CARDS);

  public cards = computed<TaskCard[]>(() => {
    const activeId = this.projectService.activeProjectId();
    return this.allCards().filter(
      card => !card.projectId || card.projectId === activeId
    );
  });

  public selectedCard = signal<TaskCard | null>(null);

  public search(query: string): TaskCard[] {
    const q = query.toLowerCase().trim();
    if (!q) return this.cards();
    return this.cards().filter(card =>
      card.title.toLowerCase().includes(q) ||
      card.taskNumber.toLowerCase().includes(q) ||
      card.lcn.toLowerCase().includes(q) ||
      card.type.toLowerCase().includes(q)
    );
  }

  public getByLcn(lcn: string): TaskCard[] {
    return this.cards().filter(card => card.lcn.startsWith(lcn));
  }

  public select(card: TaskCard | null): void {
    this.selectedCard.set(card);
  }
}
