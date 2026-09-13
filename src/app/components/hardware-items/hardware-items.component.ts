import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HardwareService } from '../../services/hardware.service';
import { ProjectService } from '../../services/project.service';
import { HardwareItem } from '../../models/hardware-item.model';

@Component({
  selector: 'app-hardware-items',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './hardware-items.component.html'
})
export class HardwareItemsComponent {
  public hardwareService = inject(HardwareService);
  public projectService = inject(ProjectService);

  public searchQuery = signal('');

  public displayedItems = computed<HardwareItem[]>(() => {
    const q = this.searchQuery();
    return q ? this.hardwareService.search(q) : this.hardwareService.items();
  });

  public lruCount = computed(() => this.hardwareService.items().filter(i => i.isLru).length);
  public sruCount = computed(() => this.hardwareService.items().filter(i => i.isSru).length);

  public onSearch(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  public selectItem(item: HardwareItem): void {
    this.hardwareService.select(item);
  }

  public clearSelection(): void {
    this.hardwareService.select(null);
  }

  public getSmrLabel(smr: string): string {
    const map: Record<string, string> = {
      'PAOGH': 'Procured / O-Level / Overhaul',
      'PAOGD': 'Procured / Depot / Overhaul',
      'PAOGE': 'Procured / I-Level / Exchange',
      'XAOGH': 'Manufactured / O-Level',
      'XBOFH': 'Manufactured / D-Level',
    };
    return map[smr] ?? smr;
  }

  public getLevelBadgeClass(level: string): string {
    switch (level) {
      case 'O': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'I': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'D': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Discard': return 'bg-rose-100 text-rose-800 border-rose-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  }
}
