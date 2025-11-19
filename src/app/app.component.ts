import { Component, OnInit } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { DatabaseService } from './core/services/database.service';
import { SeedDataService } from './core/services/seed-data.service';
import { Capacitor } from '@capacitor/core';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent implements OnInit {
  constructor(
    private dbService: DatabaseService,
    private seedService: SeedDataService
  ) {}

  async ngOnInit() {
    // Inicializar base de datos
    await this.initializeApp();

    // Cargar preferencia de modo oscuro al iniciar la app
    this.loadDarkModePreference();
  }

  /**
   * Espera a que jeep-sqlite esté disponible en el DOM (solo en web)
   */
  private async waitForJeepSqlite(): Promise<void> {
    if (Capacitor.getPlatform() !== 'web') {
      return; // No es necesario en plataformas nativas
    }

    console.log('⏳ Esperando que jeep-sqlite esté disponible...');

    return new Promise((resolve) => {
      const checkJeepSqlite = () => {
        const jeepEl = document.querySelector('jeep-sqlite');
        if (jeepEl) {
          console.log('✅ jeep-sqlite encontrado en el DOM');
          resolve();
        } else {
          setTimeout(checkJeepSqlite, 50);
        }
      };
      checkJeepSqlite();
    });
  }

  /**
   * Inicializa la aplicación y la base de datos
   */
  private async initializeApp() {
    try {
      console.log('🚀 Inicializando aplicación...');

      // 0. Esperar a que jeep-sqlite esté disponible (solo en web)
      await this.waitForJeepSqlite();

      // 1. Inicializar base de datos
      await this.dbService.initDatabase();
      console.log('✅ Base de datos inicializada');

      // 2. Verificar si es primera ejecución
      const hasData = await this.seedService.hasData();

      if (!hasData) {
        console.log('📦 Primera ejecución detectada, poblando base de datos...');
        await this.seedService.seedDatabase();
        console.log('✅ Base de datos poblada con datos de prueba');
      } else {
        console.log('✅ Base de datos ya contiene datos');

        // DESARROLLO: Recreando datos con estructura correcta
        await this.seedService.clearAllData();
        await this.seedService.seedDatabase();
      }

      console.log('🎉 Aplicación lista!');
    } catch (error) {
      console.error('❌ Error inicializando aplicación:', error);
      // En producción, aquí podrías mostrar un mensaje al usuario
      // o intentar recuperar de alguna manera
    }
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
