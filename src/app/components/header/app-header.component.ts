import { Component, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ProjectService } from '../../services/project.service';
import { S3000LParserService } from '../../services/s3000l-parser.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app-header.component.html'
})
export class AppHeaderComponent {
  public authService = inject(AuthService);
  public projectService = inject(ProjectService);
  public parserService = inject(S3000LParserService);
  private router = inject(Router);

  public openNewProjectModal = output<void>();

  public isProjectDropdownOpen = false;
  public isUserDropdownOpen = false;

  public toggleProjectDropdown(): void {
    this.isProjectDropdownOpen = !this.isProjectDropdownOpen;
    this.isUserDropdownOpen = false;
  }

  public toggleUserDropdown(): void {
    this.isUserDropdownOpen = !this.isUserDropdownOpen;
    this.isProjectDropdownOpen = false;
  }

  public selectProject(projectId: string): void {
    this.projectService.selectProject(projectId);
    this.isProjectDropdownOpen = false;
    // Navigate to PBS module of the selected project
    this.router.navigate(['/project', projectId, 'pbs']);

    // Automatically load corresponding sample data for demo if available
    // TODO: Remplacer par un appel API GET /api/v1/projects/:id/tree
    const proj = this.projectService.activeProject();
    if (proj?.id.includes('m88')) {
      this.parserService.loadSampleData('engine');
    } else if (proj?.id.includes('gear')) {
      this.parserService.loadSampleData('landing_gear');
    } else if (proj?.id.includes('avionics')) {
      this.parserService.loadSampleData('avionics');
    }
  }

  public onNewProjectClick(): void {
    this.isProjectDropdownOpen = false;
    this.openNewProjectModal.emit();
  }

  public logout(): void {
    this.authService.logout();
  }
}
