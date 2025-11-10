import { Component, OnInit } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent implements OnInit {
  constructor() {}

  ngOnInit() {
    // Cargar preferencia de modo oscuro al iniciar la app
    this.loadDarkModePreference();
  }

  /**
   * Cargar y aplicar preferencia de modo oscuro desde localStorage
   */
  loadDarkModePreference() {
    const savedMode = localStorage.getItem('darkMode');
    const isDarkMode = savedMode === 'true';

    if (isDarkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }
}
