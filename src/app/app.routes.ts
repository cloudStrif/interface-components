import { Routes } from '@angular/router';
import { SbdDemoComponent } from './components/sbd-demo/sbd-demo.component';
import { ProjectShellComponent } from './components/project-shell/project-shell.component';
import { S3000LExplorerComponent } from './components/sbd-explorer/sbd-explorer.component';
import { HardwareItemsComponent } from './components/hardware-items/hardware-items.component';
import { TaskCardsComponent } from './components/task-cards/task-cards.component';
import { FmecaComponent } from './components/fmeca/fmeca.component';
import { LoraComponent } from './components/lora/lora.component';
import { SupportItemsComponent } from './components/support-items/support-items.component';
import { DynamicFormsDemoComponent } from './components/dynamic-forms-demo/dynamic-forms-demo.component';
import { OrgChartDemoComponent } from './components/org-chart-demo/org-chart-demo.component';
import { SchemaViewerComponent } from './components/schema-viewer/schema-viewer.component';

export const routes: Routes = [
  {
    // Route racine : vérification auth → redirection vers projet actif
    path: '',
    component: SbdDemoComponent,
  },
  {
    // Page dédiée Visualiseur de Schéma BDD & Modèle IR (accessible directement)
    path: 'schema',
    component: SchemaViewerComponent,
  },
  {
    path: 'db-schema',
    redirectTo: 'schema',
    pathMatch: 'full'
  },
  {
    // Page dédiée Organigramme Adaptatif Optimus UI (accessible directement)
    path: 'org-chart',
    component: OrgChartDemoComponent,
  },
  {
    path: 'org-chart-demo',
    redirectTo: 'org-chart',
    pathMatch: 'full'
  },
  {
    // Page dédiée Démo Dynamic Form (accessible directement)
    path: 'forms-demo',
    component: DynamicFormsDemoComponent,
  },
  {
    path: 'dynamic-form-demo',
    redirectTo: 'forms-demo',
    pathMatch: 'full'
  },
  {
    // Shell principal SLICwave avec sidebar et router-outlet enfants
    path: 'project/:id',
    component: ProjectShellComponent,
    children: [
      // Redirection par défaut vers PBS
      { path: '', redirectTo: 'pbs', pathMatch: 'full' },
      // PBS / LCN — Arborescence Product Breakdown Structure
      { path: 'pbs', component: S3000LExplorerComponent },
      // Organigramme Optimus UI
      { path: 'org-chart', component: OrgChartDemoComponent },
      // Hardware Items — Articles matériels (P/N, NSN, SMR)
      { path: 'hardware', component: HardwareItemsComponent },
      // Task Cards — Analyse de Maintenance (MTA)
      { path: 'tasks', component: TaskCardsComponent },
      // FMECA / AMDEC — Analyse de Fiabilité
      { path: 'fmeca', component: FmecaComponent },
      // LORA — Level of Repair Analysis
      { path: 'lora', component: LoraComponent },
      // Support Items — Pièces de rechange, GSE, outillage, documentation
      { path: 'support-items', component: SupportItemsComponent },
      // Visualiseur de Schéma BDD & Modèle IR
      { path: 'schema', component: SchemaViewerComponent },
      // Démo Dynamic Form avec Checkbox Groups
      { path: 'forms-demo', component: DynamicFormsDemoComponent },
    ]
  },
  {
    path: '**',
    redirectTo: '',
  },
];
