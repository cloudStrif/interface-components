import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupportItemsService } from '../../services/support-items.service';
import { ProjectService } from '../../services/project.service';
import { SupportItem, SupportItemCategory } from '../../models/support-item.model';

@Component({
  selector: 'app-support-items',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './support-items.component.html'
})
export class SupportItemsComponent {
  public supportService = inject(SupportItemsService);
  public projectService = inject(ProjectService);

  public readonly categories: Array<SupportItemCategory | 'All'> = [
    'All', 'Spare Part', 'Tool', 'GSE', 'Technical Publication', 'Training', 'Facility'
  ];

  public selectItem(item: SupportItem): void {
    this.supportService.select(item);
  }

  public setCategory(cat: SupportItemCategory | 'All'): void {
    this.supportService.setCategory(cat);
    this.supportService.select(null);
  }

  public getCategoryBadgeClass(cat: SupportItemCategory): string {
    switch (cat) {
      case 'Spare Part': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Tool': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'GSE': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Technical Publication': return 'bg-slate-100 text-slate-800 border-slate-200';
      case 'Training': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Facility': return 'bg-orange-100 text-orange-800 border-orange-200';
    }
  }

  public getCategoryIcon(cat: SupportItemCategory): string {
    switch (cat) {
      case 'Spare Part': return '🔩';
      case 'Tool': return '🔧';
      case 'GSE': return '🛠️';
      case 'Technical Publication': return '📄';
      case 'Training': return '🎓';
      case 'Facility': return '🏭';
    }
  }

  public formatCurrency(value?: number): string {
    if (value === undefined) return '—';
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);
  }
}
