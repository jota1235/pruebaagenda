import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { Capacitor } from '@capacitor/core';
import { JeepSqlite } from 'jeep-sqlite/dist/components/jeep-sqlite';
import { defineCustomElements as jeepSqlite } from 'jeep-sqlite/loader';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';

// Configurar ruta del wasm ANTES de inicializar jeep-sqlite
const platform = Capacitor.getPlatform();
if (platform === "web") {
  // Configurar la ubicación del archivo wasm
  (window as any).sqliteWasmPath = '/assets/';

  // Definir jeep-sqlite custom element para soporte web
  window.customElements.define('jeep-sqlite', JeepSqlite);
  jeepSqlite(window);
}

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular({
      animated: true  // Detectar automáticamente iOS o Android según el dispositivo
    }),
    provideRouter(routes, withPreloading(PreloadAllModules)),
  ],
});
