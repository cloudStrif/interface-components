import { Component, inject, signal, effect } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { ProjectService } from '../../services/project.service';
import { AppHeaderComponent } from '../header/app-header.component';
import { CreateProjectModalComponent } from '../create-project-modal/create-project-modal.component';

@Component({
  selector: 'app-project-shell',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    AppHeaderComponent,
    CreateProjectModalComponent
  ],
  templateUrl: './project-shell.component.html'
})
export class ProjectShellComponent {
  public authService = inject(AuthService);
  public projectService = inject(ProjectService);
  private router = inject(Router);

  public showCreateProjectModal = signal(false);
  public isSidebarCollapsed = signal(false);

  constructor() {
    // Rediriger vers login si non authentifié
    effect(() => {
      if (!this.authService.isAuthenticated()) {
        this.router.navigate(['/']);
      }
    });
  }

  public openCreateProjectModal(): void {
    this.showCreateProjectModal.set(true);
  }

  public closeCreateProjectModal(): void {
    this.showCreateProjectModal.set(false);
  }

  public toggleSidebar(): void {
    this.isSidebarCollapsed.update(v => !v);
  }

  /**
   * Navigation items for the SLICwave sidebar
   * Modify this array to add or reorder modules
   */
  public readonly navItems = [
    {
      id: 'pbs',
      label: 'PBS / LCN',
      sublabel: 'Arborescence',
      path: 'pbs',
      icon: `<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M4 6h16M4 10h16M4 14h16M4 18h16"/>
      </svg>`
    },
    {
      id: 'hardware',
      label: 'Hardware Items',
      sublabel: 'Articles matériels',
      path: 'hardware',
      icon: `<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
      </svg>`
    },
    {
      id: 'tasks',
      label: 'Task Cards',
      sublabel: 'Tâches MTA',
      path: 'tasks',
      icon: `<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
      </svg>`
    },
    {
      id: 'fmeca',
      label: 'FMECA / AMDEC',
      sublabel: 'Analyse de fiabilité',
      path: 'fmeca',
      icon: `<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
      </svg>`
    },
    {
      id: 'lora',
      label: 'LORA',
      sublabel: 'Niveau de réparation',
      path: 'lora',
      icon: `<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
      </svg>`
    },
    {
      id: 'support-items',
      label: 'Support Items',
      sublabel: 'GSE & Rechanges',
      path: 'support-items',
      icon: `<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
      </svg>`
    },
    {
      id: 'forms-demo',
      label: 'Dynamic Form',
      sublabel: 'Checkbox Groups',
      path: 'forms-demo',
      icon: `<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>
      </svg>`
    }
  ];
}
