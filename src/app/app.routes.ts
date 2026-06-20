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
    path: 'top-scorers',
    loadComponent: () => import('./features/top-scorers/top-scorers.component').then(m => m.TopScorersComponent)
  },
  {
    path: 'classification',
    loadComponent: () => import('./features/classification/classification.component').then(m => m.ClassificationComponent)
  },
  {
    path: '**',
    redirectTo: 'schedule'
  }
];
