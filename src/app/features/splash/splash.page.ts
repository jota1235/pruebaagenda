import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-splash',
  templateUrl: './splash.page.html',
  styleUrls: ['./splash.page.scss'],
  standalone: true,
  imports: [IonContent, CommonModule]
})
export class SplashPage implements OnInit {
  showContent = false;
  clickEffect = false;
  showText = false;

  constructor(private router: Router) {}

  ngOnInit() {
    // Mostrar el contenedor
    setTimeout(() => {
      this.showContent = true;
    }, 100);

    // Activar efecto de clic en los rombos (después de que entren los 3 rombos: 0s, 0.15s, 0.30s + 0.4s animación)
    setTimeout(() => {
      this.clickEffect = true;
    }, 1100);

    // Mostrar texto SyServ
    setTimeout(() => {
      this.showText = true;
    }, 1400);

    // Navegar al login después de la animación completa
    setTimeout(() => {
      this.navigateToLogin();
    }, 2900);
  }

  /**
   * Navegar al login con animación
   */
  navigateToLogin() {
    this.router.navigate(['/login'], {
      replaceUrl: true // No guardar en historial
    });
  }
}
