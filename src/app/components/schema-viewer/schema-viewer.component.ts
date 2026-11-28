import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Signal,
  WritableSignal,
  signal,
  computed,
  ElementRef,
  viewChild,
  HostListener,
  effect
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CdkDragEnd, DragDropModule } from '@angular/cdk/drag-drop';
import {
  IRModelJSON,
  IREntity,
  IRColumn,
  IRJoinTable,
  IREnum,
  IRSimpleType,
  IRValueType
} from '../../models/ir-model';
import { MOCK_IR_MODEL_JSON } from '../../mock-data/mock-ir-model.data';

export type SchemaViewMode = 'graph' | 'dictionary' | 'joins' | 'types' | 'ddl' | 'json';

export interface EntityPosition {
  x: number;
  y: number;
}

export interface RelationshipWire {
  id: string;
  sourceEntity: string;
  sourceColumn: string;
  targetEntity: string;
  targetColumn: string;
  kind: 'fk' | 'join';
  label: string;
  path: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

@Component({
  selector: 'app-schema-viewer',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, DragDropModule],
  templateUrl: './schema-viewer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SchemaViewerComponent implements OnInit {
  /** Modèle IR principal chargé */
  public readonly modelData: WritableSignal<IRModelJSON> = signal(MOCK_IR_MODEL_JSON);

  /** Mode d'affichage actif */
  public readonly activeViewMode: WritableSignal<SchemaViewMode> = signal('graph');

  /** Entité actuellement sélectionnée pour inspection */
  public readonly selectedEntity: WritableSignal<IREntity | null> = signal(null);

  /** Entité survolée */
  public readonly hoveredEntity: WritableSignal<string | null> = signal(null);

  /** Terme de recherche global */
  public readonly searchQuery: WritableSignal<string> = signal('');

  /** Niveau de zoom du canvas ERD */
  public readonly zoomLevel: WritableSignal<number> = signal(1);

  /** Coordonnées (x, y) de chaque table sur le canvas */
  public readonly entityPositions: WritableSignal<Record<string, EntityPosition>> = signal({});

  /** Référence du conteneur canvas */
  public readonly canvasRef = viewChild<ElementRef<HTMLDivElement>>('canvasContainer');

  /** État de copie du code SQL ou JSON */
  public readonly isCopied: WritableSignal<boolean> = signal(false);

  /** Modal d'import de JSON personnalisé */
  public readonly showImportModal: WritableSignal<boolean> = signal(false);
  public customJsonInput = '';
  public importError: WritableSignal<string | null> = signal(null);

  constructor() {
    // Recalculer les positions si le modèle change
    effect(() => {
      const model = this.modelData();
      if (model?.entities) {
        this.initializeEntityPositions(Object.keys(model.entities));
      }
    });
  }

  ngOnInit(): void {
    const entityNames = Object.keys(this.modelData().entities);
    this.initializeEntityPositions(entityNames);

    // Sélectionner la première entité par défaut
    if (entityNames.length > 0) {
      this.selectedEntity.set(this.modelData().entities[entityNames[0]]);
    }
  }

  /**
   * Positionne les tables sur une grille élégante multi-colonnes
   */
  public initializeEntityPositions(entityNames: string[]): void {
    const positions: Record<string, EntityPosition> = {};
    const cols = 5;
    const cardWidth = 360;
    const cardHeight = 460;
    const gapX = 140;
    const gapY = 90;
    const startX = 60;
    const startY = 60;

    entityNames.forEach((name, idx) => {
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      positions[name] = {
        x: startX + col * (cardWidth + gapX),
        y: startY + row * (cardHeight + gapY)
      };
    });

    this.entityPositions.set(positions);
  }

  /**
   * Liste des entités filtrées par la recherche
   */
  public readonly filteredEntities: Signal<IREntity[]> = computed(() => {
    const entities = Object.values(this.modelData().entities);
    const query = this.searchQuery().trim().toLowerCase();
    if (!query) return entities;

    return entities.filter(e => {
      const matchName = e.name.toLowerCase().includes(query);
      const matchTable = e.tableName.toLowerCase().includes(query);
      const matchCol = e.columns.some(c =>
        c.name.toLowerCase().includes(query) ||
        c.columnName.toLowerCase().includes(query) ||
        c.sqlType.toLowerCase().includes(query)
      );
      return matchName || matchTable || matchCol;
    });
  });

  /**
   * Statistiques globales du modèle
   */
  public readonly modelStats = computed(() => {
    const model = this.modelData();
    const entities = Object.values(model.entities);
    const totalColumns = entities.reduce((sum, e) => sum + e.columns.length, 0);
    const totalPks = entities.reduce((sum, e) => sum + e.columns.filter(c => c.isPrimaryKey).length, 0);
    const totalFks = entities.reduce((sum, e) => sum + e.columns.filter(c => c.isForeignKey).length, 0);
    const joinTablesCount = Object.keys(model.joinTables || {}).length;
    const enumsCount = Object.keys(model.enums || {}).length;
    const simpleTypesCount = Object.keys(model.simpleTypes || {}).length;

    return {
      entitiesCount: entities.length,
      totalColumns,
      totalPks,
      totalFks,
      joinTablesCount,
      enumsCount,
      simpleTypesCount
    };
  });

  /**
   * Câbles de relations SVG calculés dynamiquement entre les tables
   */
  public readonly relationshipWires: Signal<RelationshipWire[]> = computed(() => {
    const model = this.modelData();
    const positions = this.entityPositions();
    const wires: RelationshipWire[] = [];
    const cardWidth = 320;
    const headerHeight = 52;
    const colHeight = 30;

    // 1. Clés étrangères directes (1:N ou 1:1)
    for (const [entityName, entity] of Object.entries(model.entities)) {
      const sourcePos = positions[entityName];
      if (!sourcePos) continue;

      entity.columns.forEach((col, colIdx) => {
        if (col.isForeignKey && col.referencesEntity && model.entities[col.referencesEntity]) {
          const targetPos = positions[col.referencesEntity];
          if (!targetPos) return;

          // Point de départ : côté droit de la carte source au niveau de la ligne de colonne
          const startX = sourcePos.x + cardWidth;
          const startY = sourcePos.y + headerHeight + colIdx * colHeight + colHeight / 2;

          // Point d'arrivée : côté gauche de la table cible
          const endX = targetPos.x;
          const endY = targetPos.y + headerHeight + colHeight / 2;

          const dx = Math.abs(endX - startX) * 0.5;
          const path = `M ${startX} ${startY} C ${startX + Math.max(dx, 40)} ${startY}, ${endX - Math.max(dx, 40)} ${endY}, ${endX} ${endY}`;

          wires.push({
            id: `${entityName}_${col.columnName}_to_${col.referencesEntity}`,
            sourceEntity: entityName,
            sourceColumn: col.columnName,
            targetEntity: col.referencesEntity,
            targetColumn: 'id',
            kind: 'fk',
            label: `${col.columnName} ➔ ${col.referencesEntity}`,
            path,
            startX,
            startY,
            endX,
            endY
          });
        }
      });
    }

    // 2. Tables de jonction N:M
    for (const [joinName, join] of Object.entries(model.joinTables || {})) {
      const leftPos = positions[join.leftEntity];
      const rightPos = positions[join.rightEntity];
      if (!leftPos || !rightPos) continue;

      const startX = leftPos.x + cardWidth;
      const startY = leftPos.y + headerHeight + 20;

      const endX = rightPos.x;
      const endY = rightPos.y + headerHeight + 20;

      const dx = Math.abs(endX - startX) * 0.5;
      const path = `M ${startX} ${startY} C ${startX + Math.max(dx, 60)} ${startY}, ${endX - Math.max(dx, 60)} ${endY}, ${endX} ${endY}`;

      wires.push({
        id: `join_${joinName}`,
        sourceEntity: join.leftEntity,
        sourceColumn: join.leftColumn,
        targetEntity: join.rightEntity,
        targetColumn: join.rightColumn,
        kind: 'join',
        label: `N:M via ${join.tableName}`,
        path,
        startX,
        startY,
        endX,
        endY
      });
    }

    return wires;
  });

  /**
   * Met à jour la position d'une table lors d'un déplacement à la souris
   */
  public onDragEnded(event: CdkDragEnd, entityName: string): void {
    const current = this.entityPositions();
    const prevPos = current[entityName] || { x: 0, y: 0 };
    const distance = event.distance;

    const newPositions = {
      ...current,
      [entityName]: {
        x: Math.max(20, Math.round(prevPos.x + distance.x)),
        y: Math.max(20, Math.round(prevPos.y + distance.y))
      }
    };

    this.entityPositions.set(newPositions);
    // Réinitialiser la translation interne du drag CDK car la position absolue est stockée
    event.source.reset();
  }

  /**
   * Vérifie si un câble est connecté à l'entité active
   */
  public isWireHighlighted(wire: RelationshipWire): boolean {
    const selected = this.selectedEntity()?.name;
    const hovered = this.hoveredEntity();
    const active = hovered || selected;
    if (!active) return false;
    return wire.sourceEntity === active || wire.targetEntity === active;
  }

  /**
   * Sélectionne une entité
   */
  public selectEntity(entity: IREntity): void {
    this.selectedEntity.set(entity);
  }

  /**
   * Génère le code SQL DDL complet pour toutes les entités
   */
  public readonly generatedFullSqlDdl: Signal<string> = computed(() => {
    const model = this.modelData();
    const lines: string[] = [];

    lines.push(`-- ==========================================================`);
    lines.push(`-- SCHÉMA DE BASE DE DONNÉES S3000L ISSUE ${model.s3000lDialect || '2.0'}`);
    lines.push(`-- Généré automatiquement depuis IRModelJSON`);
    lines.push(`-- ==========================================================\n`);

    // 1. Énumérations
    lines.push(`-- 1. ÉNUMÉRATIONS POSTGRESQL / SQL`);
    for (const [enumName, enumDef] of Object.entries(model.enums || {})) {
      const vals = enumDef.values.map(v => `'${v}'`).join(', ');
      lines.push(`CREATE TYPE ${enumDef.tableName}_type AS ENUM (${vals});`);
    }
    lines.push('');

    // 2. Tables d'entités
    lines.push(`-- 2. TABLES DES ENTITÉS`);
    for (const entity of Object.values(model.entities)) {
      lines.push(`CREATE TABLE ${entity.tableName} (`);
      const colDefs: string[] = [];

      for (const col of entity.columns) {
        let def = `  ${col.columnName} ${col.sqlType}`;
        if (col.isPrimaryKey) {
          def += ' PRIMARY KEY';
        } else if (!col.nullable) {
          def += ' NOT NULL';
        }
        if (col.defaultValue) {
          def += ` DEFAULT ${col.defaultValue}`;
        }
        colDefs.push(def);
      }

      // Clés étrangères
      for (const col of entity.columns) {
        if (col.isForeignKey && col.referencesEntity && model.entities[col.referencesEntity]) {
          const targetTable = model.entities[col.referencesEntity].tableName;
          colDefs.push(`  CONSTRAINT fk_${entity.tableName}_${col.columnName} FOREIGN KEY (${col.columnName}) REFERENCES ${targetTable}(id) ON DELETE CASCADE`);
        }
      }

      lines.push(colDefs.join(',\n'));
      lines.push(`);\n`);
    }

    // 3. Tables de jonction N:M
    lines.push(`-- 3. TABLES DE JONCTION N:M`);
    for (const join of Object.values(model.joinTables || {})) {
      const leftTable = model.entities[join.leftEntity]?.tableName || join.leftEntity;
      const rightTable = model.entities[join.rightEntity]?.tableName || join.rightEntity;

      lines.push(`CREATE TABLE ${join.tableName} (`);
      lines.push(`  ${join.leftColumn} UUID NOT NULL REFERENCES ${leftTable}(id) ON DELETE CASCADE,`);
      lines.push(`  ${join.rightColumn} UUID NOT NULL REFERENCES ${rightTable}(id) ON DELETE CASCADE,`);
      lines.push(`  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,`);
      lines.push(`  PRIMARY KEY (${join.leftColumn}, ${join.rightColumn})`);
      lines.push(`);\n`);
    }

    return lines.join('\n');
  });

  /**
   * Génère le DDL SQL pour l'entité sélectionnée
   */
  public getEntitySqlDdl(entity: IREntity): string {
    const lines: string[] = [];
    lines.push(`CREATE TABLE ${entity.tableName} (`);
    const colDefs: string[] = [];

    for (const col of entity.columns) {
      let def = `  ${col.columnName} ${col.sqlType}`;
      if (col.isPrimaryKey) {
        def += ' PRIMARY KEY';
      } else if (!col.nullable) {
        def += ' NOT NULL';
      }
      if (col.defaultValue) {
        def += ` DEFAULT ${col.defaultValue}`;
      }
      colDefs.push(def);
    }

    lines.push(colDefs.join(',\n'));
    lines.push(`);`);
    return lines.join('\n');
  }

  /**
   * Retourne la couleur Tailwind du type SQL
   */
  public getSqlTypeBadgeClasses(sqlType: string): string {
    const upper = (sqlType || '').toUpperCase();
    if (upper.includes('UUID') || upper.includes('ID')) {
      return 'bg-purple-50 text-purple-700 border-purple-200';
    }
    if (upper.includes('INT') || upper.includes('NUMERIC') || upper.includes('DECIMAL') || upper.includes('DOUBLE')) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
    if (upper.includes('CHAR') || upper.includes('TEXT')) {
      return 'bg-blue-50 text-blue-700 border-blue-200';
    }
    if (upper.includes('TIME') || upper.includes('DATE')) {
      return 'bg-amber-50 text-amber-700 border-amber-200';
    }
    if (upper.includes('BOOL')) {
      return 'bg-rose-50 text-rose-700 border-rose-200';
    }
    return 'bg-slate-50 text-slate-700 border-slate-200';
  }

  /**
   * Zoom avant
   */
  public zoomIn(): void {
    this.zoomLevel.update(z => Math.min(1.8, +(z + 0.15).toFixed(2)));
  }

  /**
   * Zoom arrière
   */
  public zoomOut(): void {
    this.zoomLevel.update(z => Math.max(0.4, +(z - 0.15).toFixed(2)));
  }

  /**
   * Réinitialise le zoom
   */
  public resetZoom(): void {
    this.zoomLevel.set(1);
  }

  /**
   * Réorganise automatiquement la disposition des tables
   */
  public autoLayout(): void {
    this.initializeEntityPositions(Object.keys(this.modelData().entities));
  }

  /**
   * Aperçu optimisé du JSON pour éviter de figer le DOM sur 98 000 lignes
   */
  public readonly jsonPreviewData = computed(() => {
    const full = JSON.stringify(this.modelData(), null, 2);
    const lines = full.split('\n');
    const totalLines = lines.length;
    const preview = lines.length > 500
      ? lines.slice(0, 500).join('\n') + `\n\n// ... [+ ${totalLines - 500} lignes supplémentaires non affichées pour préserver la réactivité du navigateur]`
      : full;
    return { preview, totalLines };
  });

  /**
   * Copier le JSON complet dans le presse-papier
   */
  public copyJsonToClipboard(): void {
    this.copyToClipboard(JSON.stringify(this.modelData(), null, 2));
  }

  /**
   * Copier le texte dans le presse-papier
   */
  public copyToClipboard(text: string): void {
    navigator.clipboard?.writeText(text);
    this.isCopied.set(true);
    setTimeout(() => this.isCopied.set(false), 2000);
  }

  /**
   * Télécharger le schéma SQL sous forme de fichier .sql
   */
  public downloadSqlFile(): void {
    const ddl = this.generatedFullSqlDdl();
    const blob = new Blob([ddl], { type: 'text/sql;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `schema-s3000l-${new Date().toISOString().slice(0, 10)}.sql`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Télécharger le modèle JSON
   */
  public downloadJsonModel(): void {
    const jsonStr = JSON.stringify(this.modelData(), null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ir-model-schema.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Ouvre la modale d'importation JSON
   */
  public openImportModal(): void {
    this.customJsonInput = JSON.stringify(this.modelData(), null, 2);
    this.importError.set(null);
    this.showImportModal.set(true);
  }

  /**
   * Charge un JSON utilisateur
   */
  public applyCustomJson(): void {
    try {
      const parsed = JSON.parse(this.customJsonInput);
      if (!parsed.entities || typeof parsed.entities !== 'object') {
        throw new Error("Le format JSON doit contenir la clé 'entities' sous forme d'objet.");
      }
      this.modelData.set(parsed as IRModelJSON);
      this.showImportModal.set(false);
      this.importError.set(null);
    } catch (err: any) {
      this.importError.set(err.message || 'JSON invalide');
    }
  }

  /**
   * Réinitialise les données vers le mock complet
   */
  public resetToMock(): void {
    this.modelData.set(MOCK_IR_MODEL_JSON);
    const names = Object.keys(MOCK_IR_MODEL_JSON.entities);
    this.initializeEntityPositions(names);
    if (names.length > 0) {
      this.selectedEntity.set(MOCK_IR_MODEL_JSON.entities[names[0]]);
    }
  }
}
