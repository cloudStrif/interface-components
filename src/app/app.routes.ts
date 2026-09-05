import { Routes } from '@angular/router';
import { SafranDemoComponent } from './components/safran-demo/safran-demo.component';

export const routes: Routes = [
  {
    path: '',
    component: SafranDemoComponent,
  },
  {
    path: '**',
    redirectTo: '',
  },
];
