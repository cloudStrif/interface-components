import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ProjectService } from '../../services/project.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  public authService = inject(AuthService);
  private router = inject(Router);
  private projectService = inject(ProjectService);

  public isLoading = false;
  public showOidcDetails = false;

  public onLogin(): void {
    this.isLoading = true;
    this.authService.loginWithDarwin().then(() => {
      this.isLoading = false;
      const activeId = this.projectService.activeProjectId();
      this.router.navigate(['/project', activeId]);
    });
  }
}
