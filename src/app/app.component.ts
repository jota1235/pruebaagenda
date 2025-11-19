import { Component, OnInit } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { SeedSimpleService } from './core/services/seed-simple.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent implements OnInit {
  constructor(private seedService: SeedSimpleService) {}

  async ngOnInit() {
    // Inicializar datos
    await this.initializeApp();

    // Cargar preferencia de modo oscuro al iniciar la app
    this.loadDarkModePreference();
  }

  /**
   * Inicializa la aplicación y los datos en localStorage
   */
  private async initializeApp() {
    try {
      console.log('🚀 Inicializando aplicación con localStorage...');

      // Verificar si es primera ejecución
      const hasData = this.seedService.hasData();

      if (!hasData) {
        console.log('📦 Primera ejecución detectada, poblando localStorage...');
        await this.seedService.seedDatabase();
        console.log('✅ localStorage poblado con datos de prueba');
      } else {
        console.log('✅ localStorage ya contiene datos');

        // DESARROLLO: Recreando datos con estructura correcta
        console.log('🔄 Recreando datos en desarrollo...');
        await this.seedService.clearAllData();
        await this.seedService.seedDatabase();
      }

      console.log('🎉 Aplicación lista!');
    } catch (error) {
      console.error('❌ Error inicializando aplicación:', error);
    }
  }

  /**
   * Cargar y aplicar preferencia de modo oscuro desde localStorage
   */
  loadDarkModePreference() {
    try {
      const savedMode = localStorage.getItem('darkMode');
      const isDarkMode = savedMode === 'true';

      if (isDarkMode) {
        document.body.classList.add('dark');
      } else {
        document.body.classList.remove('dark');
      }
    } catch (error) {
      console.warn('No se pudo cargar preferencia de modo oscuro:', error);
    }
  }
}
