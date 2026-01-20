import { Routes } from '@angular/router';

export const PERSONAL_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/personal-list/personal-list.page').then(m => m.PersonalListPage)
  },
  {
    path: 'nuevo',
    loadComponent: () =>
      import('./pages/personal-create/personal-create.page').then(m => m.PersonalCreatePage)
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/personal-detail/personal-detail.page').then(m => m.PersonalDetailPage)
  },
  {
    path: ':id/editar',
    loadComponent: () =>
      import('./pages/personal-edit/personal-edit.page').then(m => m.PersonalEditPage)
  }
];
