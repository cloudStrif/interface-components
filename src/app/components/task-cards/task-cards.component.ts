import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskCardsService } from '../../services/task-cards.service';
import { ProjectService } from '../../services/project.service';
import { TaskCard, TaskType, MaintenanceLevel } from '../../models/task-card.model';

@Component({
  selector: 'app-task-cards',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './task-cards.component.html'
})
export class TaskCardsComponent {
  public taskService = inject(TaskCardsService);
  public projectService = inject(ProjectService);

  public searchQuery = signal('');
  public activeTypeFilter = signal<TaskType | 'All'>('All');
  public activeLevelFilter = signal<MaintenanceLevel | 'All'>('All');

  public displayedCards = computed<TaskCard[]>(() => {
    const q = this.searchQuery().toLowerCase();
    const typeF = this.activeTypeFilter();
    const levelF = this.activeLevelFilter();
    return this.taskService.cards().filter(card => {
      const matchQ = !q || card.title.toLowerCase().includes(q) || card.taskNumber.toLowerCase().includes(q) || card.lcn.toLowerCase().includes(q);
      const matchType = typeF === 'All' || card.type === typeF;
      const matchLevel = levelF === 'All' || card.maintenanceLevel === levelF;
      return matchQ && matchType && matchLevel;
    });
  });

  public readonly taskTypes: Array<TaskType | 'All'> = ['All', 'Preventive', 'Corrective', 'Inspection', 'Servicing', 'Diagnostic'];
  public readonly maintenanceLevels: Array<MaintenanceLevel | 'All'> = ['All', 'O', 'I', 'D'];

  public selectCard(card: TaskCard): void {
    this.taskService.select(card);
  }

  public getTypeBadgeClass(type: TaskType): string {
    switch (type) {
      case 'Preventive': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Corrective': return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'Inspection': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Servicing': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Diagnostic': return 'bg-purple-100 text-purple-800 border-purple-200';
    }
  }

  public getLevelLabel(level: MaintenanceLevel): string {
    const labels: Record<MaintenanceLevel, string> = {
      'O': 'O (Ligne)',
      'I': 'I (Atelier)',
      'D': 'D (Dépôt)'
    };
    return labels[level] ?? level;
  }

  public getLevelBadgeClass(level: MaintenanceLevel): string {
    switch (level) {
      case 'O': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'I': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'D': return 'bg-amber-100 text-amber-800 border-amber-200';
    }
  }
}
