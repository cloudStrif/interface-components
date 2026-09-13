import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FmecaService } from '../../services/fmeca.service';
import { ProjectService } from '../../services/project.service';
import { FmecaRecord, FmecaCriticality } from '../../models/fmeca.model';

@Component({
  selector: 'app-fmeca',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './fmeca.component.html'
})
export class FmecaComponent {
  public fmecaService = inject(FmecaService);
  public projectService = inject(ProjectService);

  public selectRecord(record: FmecaRecord): void {
    this.fmecaService.select(record);
  }

  public getCriticalityBadgeClass(cat: FmecaCriticality): string {
    switch (cat) {
      case 'I':   return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'II':  return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'III': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'IV':  return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    }
  }

  public getCriticalityLabel(cat: FmecaCriticality): string {
    const labels: Record<FmecaCriticality, string> = {
      'I':   'Cat. I — Catastrophique',
      'II':  'Cat. II — Critique',
      'III': 'Cat. III — Marginale',
      'IV':  'Cat. IV — Mineure'
    };
    return labels[cat];
  }

  public formatFailureRate(rate: number): string {
    return `${rate.toFixed(3)} × 10⁻⁶ /h`;
  }
}
