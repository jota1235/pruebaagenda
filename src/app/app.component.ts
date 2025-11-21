import { Component, OnInit } from '@angular/core';
import { IonApp, IonRouterOutlet, Platform } from '@ionic/angular/standalone';
import { SeedSimpleService } from './core/services/seed-simple.service';
import { DatabaseService } from './core/services/database.service';
import { Capacitor } from '@capacitor/core';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent implements OnInit {
  constructor(
    private platform: Platform,
    private seedService: SeedSimpleService,
    private databaseService: DatabaseService
  ) {}

  async ngOnInit() {
    // Inicializar aplicación
    await this.initializeApp();

    // Cargar preferencia de modo oscuro
    this.loadDarkModePreference();
  }

  /**
   * Inicializa la aplicación, la base de datos y los datos
   *
   * Estrategia:
   * - En Android/iOS: Intenta usar SQLite primero, fallback a localStorage
   * - En Web: Usa localStorage directamente
   */
  private async initializeApp() {
    try {
      console.log('🚀 [AppComponent] Iniciando aplicación...');

      // 1. Esperar a que la plataforma esté lista (CRÍTICO para SQLite)
      await this.platform.ready();
      console.log('✅ Plataforma lista:', Capacitor.getPlatform());

      // 2. Intentar inicializar SQLite (solo en plataformas nativas)
      const isNative = Capacitor.isNativePlatform();
      let sqliteInitialized = false;

      if (isNative) {
        console.log('📱 Plataforma nativa detectada, intentando inicializar SQLite...');
        try {
          await this.databaseService.init();
          sqliteInitialized = this.databaseService.isReady();

          if (sqliteInitialized) {
            console.log('✅ SQLite inicializado correctamente');
          } else {
            console.log('⚠️ SQLite no se inicializó, usando localStorage como fallback');
          }
        } catch (error) {
          console.error('❌ Error inicializando SQLite, usando localStorage como fallback:', error);
          sqliteInitialized = false;
        }
      } else {
        console.log('🌐 Plataforma web detectada, usando localStorage');
      }

      // 3. Si SQLite no está disponible, usar localStorage
      if (!sqliteInitialized) {
        console.log('📦 Inicializando localStorage...');
        const hasData = this.seedService.hasData();

        if (!hasData) {
          console.log('📦 Primera ejecución, poblando localStorage...');
          await this.seedService.seedDatabase();
          console.log('✅ localStorage poblado con datos de prueba');
        } else {
          console.log('✅ localStorage ya contiene datos');

          // DESARROLLO: Recrear datos para pruebas
          console.log('🔄 [DEV] Recreando datos en localStorage...');
          await this.seedService.clearAllData();
          await this.seedService.seedDatabase();
        }
      }

      console.log('🎉 [AppComponent] Aplicación completamente inicializada');

    } catch (error) {
      console.error('❌ [AppComponent] Error CRÍTICO inicializando aplicación:', error);
      console.error('Tipo:', typeof error);
      console.error('Stack:', (error as any)?.stack);
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
