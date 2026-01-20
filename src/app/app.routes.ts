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

  // Clientes
  {
    path: 'clientes',
    loadChildren: () => import('./features/clientes/clientes.routes').then((m) => m.CLIENTES_ROUTES),
  },

  // Servicios
  {
    path: 'servicios',
    loadChildren: () => import('./features/servicios/servicios.routes').then((m) => m.SERVICIOS_ROUTES),
  },

  // Personal
  {
    path: 'personal',
    loadChildren: () => import('./features/personal/personal.routes').then((m) => m.PERSONAL_ROUTES),
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
