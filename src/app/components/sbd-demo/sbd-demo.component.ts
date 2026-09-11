import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { LoginComponent } from '../login/login.component';
import { AppHeaderComponent } from '../header/app-header.component';
import { S3000LExplorerComponent } from '../sbd-explorer/sbd-explorer.component';
import { CreateProjectModalComponent } from '../create-project-modal/create-project-modal.component';

@Component({
  selector: 'app-sbd-demo',
  standalone: true,
  imports: [
    CommonModule, 
    LoginComponent, 
    AppHeaderComponent, 
    S3000LExplorerComponent, 
    CreateProjectModalComponent
  ],
  templateUrl: './sbd-demo.component.html'
})
export class SbdDemoComponent {
  public authService = inject(AuthService);

  public showCreateProjectModal = false;

  public openCreateProjectModal(): void {
    this.showCreateProjectModal = true;
  }

  public closeCreateProjectModal(): void {
    this.showCreateProjectModal = false;
  }
}
