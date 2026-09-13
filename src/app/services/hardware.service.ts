import { Injectable, signal, computed, inject } from '@angular/core';
import { HardwareItem } from '../models/hardware-item.model';
import { MOCK_HARDWARE_ITEMS } from '../mock-data/mock-hardware.data';
import { ProjectService } from './project.service';

/**
 * ============================================================================
 * HardwareService — Gestion des Articles Matériels (Hardware Items)
 * ============================================================================
 * Expose les données HW via des Signals Angular réactifs.
 *
 * // TODO: [INTÉGRATION BACKEND / API REST]
 * // 1. Injecter HttpClient : private http = inject(HttpClient);
 * // 2. Charger les données au changement de projet :
 * //    effect(() => { const id = this.projectService.activeProjectId();
 * //      this.http.get<HardwareItem[]>(`/api/v1/projects/${id}/hardware-items`)
 * //        .subscribe(items => this.allItems.set(items)); });
 * // 3. Pour créer : POST /api/v1/projects/:id/hardware-items
 * // 4. Pour modifier : PUT /api/v1/projects/:id/hardware-items/:hwId
 */
@Injectable({ providedIn: 'root' })
export class HardwareService {
  private projectService = inject(ProjectService);

  /** Signal interne: tous les articles du jeu de données courant */
  private allItems = signal<HardwareItem[]>(MOCK_HARDWARE_ITEMS);

  /** Articles filtrés par projet actif */
  public items = computed<HardwareItem[]>(() => {
    const activeId = this.projectService.activeProjectId();
    return this.allItems().filter(
      item => !item.projectId || item.projectId === activeId
    );
  });

  /** Recherche par nom, P/N, LCN, NSN */
  public search(query: string): HardwareItem[] {
    const q = query.toLowerCase().trim();
    if (!q) return this.items();
    return this.items().filter(item =>
      item.name.toLowerCase().includes(q) ||
      item.partNumber.toLowerCase().includes(q) ||
      item.lcn.toLowerCase().includes(q) ||
      (item.nsnNumber?.toLowerCase().includes(q) ?? false)
    );
  }

  public getByLcn(lcn: string): HardwareItem[] {
    return this.items().filter(item => item.lcn.startsWith(lcn));
  }

  public selectItem = signal<HardwareItem | null>(null);

  public select(item: HardwareItem | null): void {
    this.selectItem.set(item);
  }
}
