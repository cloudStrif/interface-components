import { Injectable, signal, computed, inject } from '@angular/core';
import { LoraRecord } from '../models/lora.model';
import { MOCK_LORA_RECORDS } from '../mock-data/mock-lora.data';
import { ProjectService } from './project.service';

/**
 * ============================================================================
 * LoraService — Gestion des Analyses LORA (Level of Repair Analysis)
 * ============================================================================
 * Expose les records LORA via des Signals Angular réactifs.
 *
 * // TODO: [INTÉGRATION BACKEND / API REST]
 * // 1. GET /api/v1/projects/:projectId/lora
 * // 2. POST /api/v1/projects/:projectId/lora
 * // 3. PUT /api/v1/projects/:projectId/lora/:id
 */
@Injectable({ providedIn: 'root' })
export class LoraService {
  private projectService = inject(ProjectService);

  private allRecords = signal<LoraRecord[]>(MOCK_LORA_RECORDS);

  public records = computed<LoraRecord[]>(() => {
    const activeId = this.projectService.activeProjectId();
    return this.allRecords().filter(
      r => !r.projectId || r.projectId === activeId
    );
  });

  public selectedRecord = signal<LoraRecord | null>(null);

  /** Résumé des décisions LORA */
  public decisionStats = computed(() => {
    const recs = this.records();
    return {
      repairO: recs.filter(r => r.recommendedLevel === 'O').length,
      repairI: recs.filter(r => r.recommendedLevel === 'I').length,
      repairD: recs.filter(r => r.recommendedLevel === 'D').length,
      discard: recs.filter(r => r.recommendedLevel === 'Discard').length,
      total: recs.length
    };
  });

  public select(record: LoraRecord | null): void {
    this.selectedRecord.set(record);
  }
}
