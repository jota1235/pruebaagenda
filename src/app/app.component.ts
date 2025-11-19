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
  ) {
    console.log('✅ AppComponent constructor completado');
  }

  ngOnInit() {
    console.log('🚀 AppComponent ngOnInit iniciado');

    // Cargar preferencia de modo oscuro primero (más seguro)
    try {
      this.loadDarkModePreference();
    } catch (error) {
      console.error('Error al cargar modo oscuro:', error);
    }

    // Inicializar base de datos de forma no bloqueante
    setTimeout(() => {
      this.initializeApp().catch(error => {
        console.error('Error crítico en inicialización:', error);
        // No lanzar el error para evitar crash de la app
      });
    }, 100);
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
      const platform = Capacitor.getPlatform();
      console.log('🚀 Inicializando aplicación en plataforma:', platform);

      // TEMPORALMENTE: Solo inicializar en web para debugging
      if (platform === 'web') {
        console.log('🌐 Plataforma web detectada');
        await this.waitForJeepSqlite();
        console.log('✅ Web listo');
      } else {
        console.log('📱 Plataforma nativa detectada');
        console.log('⚠️ Inicialización de BD deshabilitada temporalmente');
        console.log('💡 La app usará datos mock por ahora');
        // TODO: Habilitar cuando funcione correctamente
        /*
        await this.dbService.initDatabase();
        const hasData = await this.seedService.hasData();
        if (!hasData) {
          await this.seedService.seedDatabase();
        }
        */
      }

      console.log('🎉 Aplicación inicializada');

    } catch (error) {
      console.error('❌ Error inicializando aplicación:', error);
      console.error('❌ Stack:', (error as any)?.stack || 'No stack available');
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
