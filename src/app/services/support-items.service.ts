import { Injectable, signal, computed, inject } from '@angular/core';
import { SupportItem, SupportItemCategory } from '../models/support-item.model';
import { MOCK_SUPPORT_ITEMS } from '../mock-data/mock-support-items.data';
import { ProjectService } from './project.service';

/**
 * ============================================================================
 * SupportItemsService — Gestion des Articles de Soutien (GSE, Rechanges, Docs)
 * ============================================================================
 * Expose les Support Items via des Signals Angular réactifs.
 *
 * // TODO: [INTÉGRATION BACKEND / API REST]
 * // 1. GET /api/v1/projects/:projectId/support-items
 * // 2. POST /api/v1/projects/:projectId/support-items
 * // 3. PUT /api/v1/projects/:projectId/support-items/:id
 */
@Injectable({ providedIn: 'root' })
export class SupportItemsService {
  private projectService = inject(ProjectService);

  private allItems = signal<SupportItem[]>(MOCK_SUPPORT_ITEMS);

  public items = computed<SupportItem[]>(() => {
    const activeId = this.projectService.activeProjectId();
    return this.allItems().filter(
      item => !item.projectId || item.projectId === activeId
    );
  });

  public selectedItem = signal<SupportItem | null>(null);

  public activeCategory = signal<SupportItemCategory | 'All'>('All');

  public filteredItems = computed<SupportItem[]>(() => {
    const cat = this.activeCategory();
    const all = this.items();
    return cat === 'All' ? all : all.filter(i => i.category === cat);
  });

  public categoryStats = computed(() => {
    const all = this.items();
    const categories: SupportItemCategory[] = ['Spare Part', 'Tool', 'GSE', 'Technical Publication', 'Training', 'Facility'];
    return categories.map(cat => ({
      category: cat,
      count: all.filter(i => i.category === cat).length
    }));
  });

  public setCategory(cat: SupportItemCategory | 'All'): void {
    this.activeCategory.set(cat);
  }

  public select(item: SupportItem | null): void {
    this.selectedItem.set(item);
  }
}
