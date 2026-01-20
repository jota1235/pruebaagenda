import { Routes } from '@angular/router';

export const CLIENTES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/cliente-list/cliente-list.page').then(m => m.ClienteListPage)
  },
  {
    path: 'nuevo',
    loadComponent: () =>
      import('./pages/cliente-create/cliente-create.page').then(m => m.ClienteCreatePage)
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/cliente-detail/cliente-detail.page').then(m => m.ClienteDetailPage)
  },
  {
    path: ':id/editar',
    loadComponent: () =>
      import('./pages/cliente-edit/cliente-edit.page').then(m => m.ClienteEditPage)
  }
];
