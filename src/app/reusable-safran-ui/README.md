# 🚀 Safran Reusable UI Kit — Guide d'Export & Réutilisation

Bibliothèque de composants Angular Standalone réutilisables, **100% Tailwind CSS**, sans dépendances tierces complexes.

---

## 📁 Structure du Dossier Réutilisable

Pour exporter ces composants dans votre autre projet Angular, **copiez simplement ce dossier `reusable-safran-ui/`** dans le dossier `src/app/` de votre projet destination.

```text
reusable-safran-ui/
├── components/
│   ├── safran-dropdown/       # Dropdown avec recherche & adapter API
│   ├── safran-dynamic-form/   # Formulaire dynamique avec Angular Reactive Forms (FormGroup)
│   ├── safran-file-tree/      # Arborescence hiérarchique (Tree)
│   └── safran-form-wizard/    # Assistant / Stepper multi-étapes
├── models/                    # Interfaces TypeScript (Form, Dropdown, Tree, Wizard)
├── services/                  # SafranFormBuilderService (DSL Fluent optionnel)
└── index.ts                   # Exportations publiques
```

---

## 🛠️ 1. Formulaire CRUD avec votre propre `FormGroup` & API

Le composant `<app-safran-dynamic-form>` génère et gère automatiquement le `FormGroup` d'Angular Reactive Forms à partir d'un schéma simple.

### Exemple dans votre composant (`mon-crud.component.ts`) :

```ts
import { Component, inject, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SafranDynamicFormComponent, SafranFormFieldSchema, SafranFormSubmitEvent } from './reusable-safran-ui';

@Component({
  selector: 'app-mon-crud',
  standalone: true,
  imports: [SafranDynamicFormComponent],
  template: `
    <app-safran-dynamic-form
      [fields]="formFields"
      [initialData]="itemToEdit"
      [recordId]="itemId"
      [loading]="isSubmitting"
      title="Édition d'Équipement"
      (formSubmit)="onSaveToMyApi($event)"
    ></app-safran-dynamic-form>
  `
})
export class MonCrudComponent implements OnInit {
  private http = inject(HttpClient);

  public isSubmitting = false;
  public itemToEdit: any = null;
  public itemId: string | null = null;

  // Définition des champs du formulaire
  public formFields: SafranFormFieldSchema[] = [
    { key: 'code', label: 'Code Référence', type: 'text', gridCols: 'half', validation: { required: true } },
    { key: 'nom', label: 'Nom du Composant', type: 'text', gridCols: 'half', validation: { required: true } },
    { key: 'categorie', label: 'Catégorie', type: 'select', gridCols: 'half', options: [
        { label: 'Optronique', value: 'OPT' },
        { label: 'Avionique', value: 'AVIO' }
      ]
    },
    { key: 'remarques', label: 'Remarques', type: 'textarea', gridCols: 'full' }
  ];

  ngOnInit() {
    // Exemple : Chargement depuis votre API REST
    this.http.get('https://votre-api.interne/equipements/123').subscribe(data => {
      this.itemToEdit = data;
      this.itemId = '123';
    });
  }

  // Soumission vers votre API REST
  onSaveToMyApi(event: SafranFormSubmitEvent) {
    this.isSubmitting = true;
    const payload = event.value; // Données brutes du FormGroup

    if (event.mode === 'edit') {
      this.http.put(`https://votre-api.interne/equipements/${event.recordId}`, payload)
        .subscribe(() => this.isSubmitting = false);
    } else {
      this.http.post('https://votre-api.interne/equipements', payload)
        .subscribe(() => this.isSubmitting = false);
    }
  }
}
```

---

## 🔍 2. Dropdown avec Recherche & Données de votre API

Le composant `<app-safran-dropdown>` s'adapte automatiquement à la structure des objets de votre API :

```html
<app-safran-dropdown
  [items]="mesDonneesApi"
  labelKey="designation"
  valueKey="idEquipement"
  placeholder="Sélectionnez un élément..."
  (selectionChange)="onItemSelect($event)"
></app-safran-dropdown>
```

---

## 📂 3. Arborescence Logistique (Tree)

```html
<app-safran-file-tree
  [nodes]="arborescenceData"
  (nodeSelect)="onNodeClick($event)"
></app-safran-file-tree>
```

---

## 🎨 4. Style 100% Tailwind CSS Natif

Tous les composants utilisent **uniquement des utilitaires Tailwind CSS** (`bg-[#00205B]`, `bg-[#009CDE]`, `text-slate-800`, `rounded-lg`, etc.).

Aucun fichier `.css` custom n'est requis. Assurez-vous simplement que Tailwind CSS est installé dans votre projet cible.
