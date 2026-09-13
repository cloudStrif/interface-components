import { Component, inject, effect } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ProjectService } from '../../services/project.service';
import { LoginComponent } from '../login/login.component';

/**
 * SbdDemoComponent — Auth Gate
 * Redirige vers le projet actif si authentifié, sinon affiche le login SSO.
 */
@Component({
  selector: 'app-sbd-demo',
  standalone: true,
  imports: [LoginComponent],
  templateUrl: './sbd-demo.component.html'
})
export class SbdDemoComponent {
  public authService = inject(AuthService);
  private projectService = inject(ProjectService);
  private router = inject(Router);

  constructor() {
    // Dès qu'on est authentifié → naviguer vers le projet actif
    effect(() => {
      if (this.authService.isAuthenticated()) {
        const activeId = this.projectService.activeProjectId();
        if (activeId) {
          this.router.navigate(['/project', activeId, 'pbs']);
        } else {
          this.router.navigate(['/project', 'no-project', 'pbs']);
        }
      }
    });
  }
}
