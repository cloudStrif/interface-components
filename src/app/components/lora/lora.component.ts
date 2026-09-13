import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoraService } from '../../services/lora.service';
import { ProjectService } from '../../services/project.service';
import { LoraRecord, LoraLevel } from '../../models/lora.model';

@Component({
  selector: 'app-lora',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lora.component.html'
})
export class LoraComponent {
  public loraService = inject(LoraService);
  public projectService = inject(ProjectService);

  public selectRecord(record: LoraRecord): void {
    this.loraService.select(record);
  }

  public getLevelBadgeClass(level: LoraLevel): string {
    switch (level) {
      case 'O': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'I': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'D': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Discard': return 'bg-rose-100 text-rose-800 border-rose-200';
    }
  }

  public getLevelLabel(level: LoraLevel): string {
    const labels: Record<LoraLevel, string> = {
      'O': 'O — Ligne de vol',
      'I': 'I — Atelier intermédiaire',
      'D': 'D — Dépôt industriel',
      'Discard': 'Rebut / Remplacement neuf'
    };
    return labels[level];
  }

  public formatCurrency(value?: number): string {
    if (value === undefined) return '—';
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);
  }
}
