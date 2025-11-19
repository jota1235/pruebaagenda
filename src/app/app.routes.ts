import { Routes } from '@angular/router';

export const routes: Routes = [
  // Splash Screen (pantalla inicial)
  {
    path: 'splash',
    loadComponent: () => import('./features/splash/splash.page').then((m) => m.SplashPage),
  },

  // Login
  {
    path: 'login',
    loadComponent: () => import('./features/auth/pages/login/login.page').then((m) => m.LoginPage),
  },

  // Menú principal (home temporal)
  {
    path: 'menu',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },

  // Agenda principal
  {
    path: 'agenda',
    loadComponent: () => import('./features/agenda/pages/agenda-main/agenda-main.page').then((m) => m.AgendaMainPage),
  },

  // Perfil del negocio
  {
    path: 'profile',
    loadComponent: () => import('./features/profile/pages/profile-main/profile-main.page').then((m) => m.ProfileMainPage),
  },

  // Configuración
  {
    path: 'settings',
    loadComponent: () => import('./features/settings/pages/settings-main/settings-main.page').then((m) => m.SettingsMainPage),
  },

  // Test pages para localStorage
  {
    path: 'test/clientes',
    loadComponent: () => import('./features/test-pages/clientes-test.page').then((m) => m.ClientesTestPage),
  },
  {
    path: 'test/personal',
    loadComponent: () => import('./features/test-pages/personal-test.page').then((m) => m.PersonalTestPage),
  },
  {
    path: 'test/servicios',
    loadComponent: () => import('./features/test-pages/servicios-test.page').then((m) => m.ServiciosTestPage),
  },

  // Alias para home (mantener compatibilidad)
  {
    path: 'home',
    redirectTo: 'menu',
    pathMatch: 'full',
  },

  // Ruta por defecto → Splash
  {
    path: '',
    redirectTo: 'splash',
    pathMatch: 'full',
  },

  // Wildcard para rutas no encontradas → Splash
  {
    path: '**',
    redirectTo: 'splash',
  },
];
