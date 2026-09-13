import { Injectable, signal, computed, inject } from '@angular/core';
import { FmecaRecord } from '../models/fmeca.model';
import { MOCK_FMECA_RECORDS } from '../mock-data/mock-fmeca.data';
import { ProjectService } from './project.service';

/**
 * ============================================================================
 * FmecaService — Gestion des Analyses AMDEC / FMECA
 * ============================================================================
 * Expose les records FMECA via des Signals Angular réactifs.
 *
 * // TODO: [INTÉGRATION BACKEND / API REST]
 * // 1. GET /api/v1/projects/:projectId/fmeca
 * // 2. POST /api/v1/projects/:projectId/fmeca
 * // 3. PUT /api/v1/projects/:projectId/fmeca/:id
 */
@Injectable({ providedIn: 'root' })
export class FmecaService {
  private projectService = inject(ProjectService);

  private allRecords = signal<FmecaRecord[]>(MOCK_FMECA_RECORDS);

  public records = computed<FmecaRecord[]>(() => {
    const activeId = this.projectService.activeProjectId();
    return this.allRecords().filter(
      r => !r.projectId || r.projectId === activeId
    );
  });

  public selectedRecord = signal<FmecaRecord | null>(null);

  /** Stats de criticité calculées */
  public criticalityStats = computed(() => {
    const recs = this.records();
    return {
      catI: recs.filter(r => r.severity === 'I').length,
      catII: recs.filter(r => r.severity === 'II').length,
      catIII: recs.filter(r => r.severity === 'III').length,
      catIV: recs.filter(r => r.severity === 'IV').length,
      total: recs.length
    };
  });

  public select(record: FmecaRecord | null): void {
    this.selectedRecord.set(record);
  }

  public getByLcn(lcn: string): FmecaRecord[] {
    return this.records().filter(r => r.lcn.startsWith(lcn));
  }
}
