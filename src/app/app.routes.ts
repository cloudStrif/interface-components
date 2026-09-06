import { Routes } from '@angular/router';
import { SbdDemoComponent } from './components/sbd-demo/sbd-demo.component';

export const routes: Routes = [
  {
    path: '',
    component: SbdDemoComponent,
  },
  {
    path: '**',
    redirectTo: '',
  },
];
