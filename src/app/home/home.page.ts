import { Component } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { calendarOutline, personOutline, settingsOutline, logOutOutline, peopleOutline, listOutline, cutOutline } from 'ionicons/icons';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonIcon,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent
  ],
})
export class HomePage {
  constructor(private router: Router) {
    // Registrar iconos
    addIcons({ calendarOutline, personOutline, settingsOutline, logOutOutline, peopleOutline, listOutline, cutOutline });
  }

  /**
   * Navegar a la agenda
   */
  goToAgenda() {
    this.router.navigate(['/agenda']);
  }

  /**
   * Navegar a perfil del negocio
   */
  goToProfile() {
    this.router.navigate(['/profile']);
  }

  /**
   * Navegar a clientes
   */
  goToClientes() {
    this.router.navigate(['/clientes']);
  }

  /**
   * Navegar a configuración
   */
  goToSettings() {
    this.router.navigate(['/settings']);
  }

  /**
   * Cerrar sesión y volver al login
   */
  logout() {
    // TODO: Limpiar sesión con authService
    this.router.navigate(['/login']);
  }

  /**
   * Navegar a servicios
   */
  goToServicios() {
    this.router.navigate(['/servicios']);
  }

  /**
   * TEST: Navegar a páginas de prueba localStorage
   */
  goToTestClientes() {
    this.router.navigate(['/test/clientes']);
  }

  goToTestPersonal() {
    this.router.navigate(['/test/personal']);
  }

  goToTestServicios() {
    this.router.navigate(['/test/servicios']);
  }
}
