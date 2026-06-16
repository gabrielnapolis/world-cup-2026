import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'schedule',
    pathMatch: 'full'
  },
  {
    path: 'schedule',
    loadComponent: () => import('./features/schedule/schedule.component').then(m => m.ScheduleComponent)
  },
  {
    path: 'groups',
    loadComponent: () => import('./features/group-stage/group-stage.component').then(m => m.GroupStageComponent)
  },
  {
    path: '**',
    redirectTo: 'schedule'
  }
];
