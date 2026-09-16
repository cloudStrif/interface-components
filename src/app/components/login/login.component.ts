import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserRole } from '../../models/user.model';

/**
 * LoginComponent — Page de connexion SLICwave
 * Sélection du profil : Administrateur / Contributeur / Lecteur
 */
@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html'
})
export class LoginComponent {
  public readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  public isLoading = false;
  public showOidcDetails = false;

  public onLogin(role: UserRole = 'administrateur'): void {
    this.isLoading = true;
    setTimeout(() => {
      this.auth.loginAs(role);
      this.isLoading = false;
      this.router.navigate(['/']);
    }, 400);
  }
}
