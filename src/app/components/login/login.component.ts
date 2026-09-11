import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  public authService = inject(AuthService);

  public selectedProfileId = 'usr-8921';
  public isLoading = false;
  public showOidcDetails = false;

  public onLogin(): void {
    this.isLoading = true;
    this.authService.loginWithDarwin(this.selectedProfileId).then(() => {
      this.isLoading = false;
    });
  }
}
