import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent,
  IonButton,
  IonInput,
  IonIcon,
  IonText,
  IonSpinner
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { logoGoogle, logoMicrosoft, eyeOutline, eyeOffOutline } from 'ionicons/icons';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonButton,
    IonInput,
    IonIcon,
    IonText,
    IonSpinner
  ]
})
export class LoginPage {
  // Form fields
  email: string = '';
  password: string = '';
  showPassword: boolean = false;

  // UI states
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(
    private router: Router
  ) {
    // Registrar iconos
    addIcons({ logoGoogle, logoMicrosoft, eyeOutline, eyeOffOutline });
  }

  /**
   * Toggle password visibility
   */
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  /**
   * Login con email y password
   * Por ahora solo navega al menú sin validación
   */
  async login() {
    this.isLoading = true;
    this.errorMessage = '';

    try {
      // Simular delay de API
      await this.delay(1000);

      // TODO: Aquí irá la llamada al servicio de autenticación
      // await this.authService.login(this.email, this.password);

      // Por ahora, navegamos directamente al menú
      this.router.navigate(['/menu']);

    } catch (error) {
      this.errorMessage = 'Error al iniciar sesión. Intenta nuevamente.';
      console.error('Login error:', error);
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Login con Google
   * Por ahora solo muestra un mensaje
   */
  async loginWithGoogle() {
    console.log('Login con Google - Por implementar');

    // Simular login exitoso
    await this.delay(500);
    this.router.navigate(['/menu']);

    // TODO: Implementar autenticación con Google OAuth
    // await this.authService.loginWithGoogle();
  }

  /**
   * Login con Microsoft
   * Por ahora solo muestra un mensaje
   */
  async loginWithMicrosoft() {
    console.log('Login con Microsoft - Por implementar');

    // Simular login exitoso
    await this.delay(500);
    this.router.navigate(['/menu']);

    // TODO: Implementar autenticación con Microsoft OAuth
    // await this.authService.loginWithMicrosoft();
  }

  /**
   * Utilidad para simular delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Validar si el formulario es válido
   */
  isFormValid(): boolean {
    return this.email.length > 0 && this.password.length > 0;
  }
}