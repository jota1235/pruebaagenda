import { Routes } from '@angular/router';

export const SERVICIOS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/servicio-list/servicio-list.page').then(m => m.ServicioListPage)
  },
  {
    path: 'nuevo',
    loadComponent: () =>
      import('./pages/servicio-create/servicio-create.page').then(m => m.ServicioCreatePage)
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/servicio-detail/servicio-detail.page').then(m => m.ServicioDetailPage)
  },
  {
    path: ':id/editar',
    loadComponent: () =>
      import('./pages/servicio-edit/servicio-edit.page').then(m => m.ServicioEditPage)
  }
];
