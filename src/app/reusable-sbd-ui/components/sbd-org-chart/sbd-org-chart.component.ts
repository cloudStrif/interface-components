import {
  Component,
  Input,
  Output,
  EventEmitter,
  Signal,
  WritableSignal,
  signal,
  computed,
  ChangeDetectionStrategy,
  ElementRef,
  viewChild,
  AfterViewInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrganizationChartModule } from '@openng/optimus-ui/organizationchart';
import { SbdOrgTreeNode, SbdOrgNodeData } from '../../../models/org-chart.model';

@Component({
  selector: 'app-sbd-org-chart',
  standalone: true,
  imports: [CommonModule, FormsModule, OrganizationChartModule],
  templateUrl: './sbd-org-chart.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SbdOrgChartComponent implements AfterViewInit {
  private readonly _dataSignal: WritableSignal<SbdOrgTreeNode[]> = signal([]);
  
  @Input() set data(val: SbdOrgTreeNode[] | null | undefined) {
    this._dataSignal.set(val || []);
  }
  get data(): SbdOrgTreeNode[] {
    return this._dataSignal();
  }

  @Input() title = 'Arborescence Hiérarchique S3000L';
  @Input() subtitle = 'Visualisation dynamique adaptative Optimus UI';
  @Input() selectionMode: 'single' | 'multiple' | null = 'single';
  @Input() collapsible = true;
  @Input() showControls = true;
  @Input() showDetailsPanel = true;

  @Output() nodeSelect = new EventEmitter<SbdOrgTreeNode>();
  @Output() nodeExpand = new EventEmitter<SbdOrgTreeNode>();
  @Output() nodeCollapse = new EventEmitter<SbdOrgTreeNode>();

  public readonly viewportRef = viewChild<ElementRef<HTMLDivElement>>('viewport');
  public readonly stageRef = viewChild<ElementRef<HTMLDivElement>>('stage');

  /**
   * Configuration Pass-Through (pt) 100% Tailwind CSS pour Optimus UI
   * Remplace intégralement tout besoin de fichier CSS externe !
   */
  public readonly chartPt = {
    table: {
      class: '!border-separate !mx-auto !w-auto !max-w-none [border-spacing:0]'
    },
    nodeChildren: ({ instance }: any) => ({
      class: !instance?.node?.expanded ? '!hidden' : ''
    }),
    connectors: ({ instance }: any) => ({
      class: !instance?.node?.expanded ? '!hidden' : ''
    }),
    connectorDown: {
      class: '!w-0.5 !bg-slate-300 !h-5 !mx-auto'
    },
    connectorLeft: {
      class: '!border-r-2 !border-slate-300 !rounded-none'
    },
    connectorTop: {
      class: '!border-t-2 !border-slate-300'
    },
    connectorRight: {
      class: '!border-l-2 !border-slate-300 !rounded-none'
    },
    node: {
      class: '!p-0 !bg-transparent !border-0 !rounded-xl !relative !inline-block !my-1 !mx-2 !transition-all !duration-200'
    },
    nodeToggleButton: {
      class: '!w-[26px] !h-[26px] !rounded-full !bg-white !border-2 !border-slate-300 !text-slate-600 !inline-flex !items-center !justify-center !-bottom-[13px] !left-1/2 !-translate-x-1/2 !z-10 !cursor-pointer !shadow-xs !transition-all !duration-200 hover:!bg-blue-600 hover:!border-blue-600 hover:!text-white hover:!scale-110 hover:!shadow-md'
    },
    nodeToggleButtonIcon: {
      class: '!w-3.5 !h-3.5'
    }
  };

  // État local réactif avec Signals
  public readonly selectedNode: WritableSignal<SbdOrgTreeNode | null> = signal(null);
  public readonly zoomLevel: WritableSignal<number> = signal(1);
  public readonly isFullscreen: WritableSignal<boolean> = signal(false);
  public readonly searchQuery: WritableSignal<string> = signal('');

  // Statistiques calculées
  public readonly treeStats: Signal<{ total: number; expanded: number; depth: number }> = computed(() => {
    const rootNodes = this._dataSignal();
    let total = 0;
    let expanded = 0;
    let maxDepth = 0;

    const traverse = (nodes: SbdOrgTreeNode[], depth: number) => {
      if (!nodes || !nodes.length) return;
      if (depth > maxDepth) maxDepth = depth;
      for (const n of nodes) {
        total++;
        if (n.expanded) expanded++;
        if (n.children && n.children.length) {
          traverse(n.children, depth + 1);
        }
      }
    };

    traverse(rootNodes, 1);
    return { total, expanded, depth: maxDepth };
  });

  // Breadcrumb du nœud sélectionné
  public readonly selectedNodeBreadcrumb: Signal<string[]> = computed(() => {
    const selected = this.selectedNode();
    if (!selected) return [];
    
    const rootNodes = this._dataSignal();
    const path: string[] = [];

    const findPath = (nodes: SbdOrgTreeNode[], targetKey: string | undefined): boolean => {
      for (const n of nodes) {
        path.push(n.label || n.data?.title || 'Nœud');
        if (n.key === targetKey || n === selected) {
          return true;
        }
        if (n.children && n.children.length) {
          if (findPath(n.children, targetKey)) return true;
        }
        path.pop();
      }
      return false;
    };

    findPath(rootNodes, selected.key);
    return path;
  });

  ngAfterViewInit(): void {
    // Recentrer la vue sur la racine au premier chargement
    setTimeout(() => {
      this.centerRootView();
    }, 100);
  }

  /**
   * Gestion de la sélection d'un nœud
   */
  public onNodeSelected(event: any): void {
    const node = event?.node || event;
    if (node) {
      this.selectedNode.set(node);
      this.nodeSelect.emit(node);
    }
  }

  /**
   * Gestion du dépliage d'un nœud
   */
  public onNodeExpanded(event: any): void {
    const node = event?.node || event;
    if (node) {
      // Forcer le signal pour recalculer les statistiques
      this._dataSignal.update(d => [...d]);
      this.nodeExpand.emit(node);
    }
  }

  /**
   * Gestion du repliage d'un nœud
   */
  public onNodeCollapsed(event: any): void {
    const node = event?.node || event;
    if (node) {
      this._dataSignal.update(d => [...d]);
      this.nodeCollapse.emit(node);
    }
  }

  /**
   * Zoom In (+15%)
   */
  public zoomIn(): void {
    this.zoomLevel.update(z => Math.min(1.8, +(z + 0.15).toFixed(2)));
  }

  /**
   * Zoom Out (-15%)
   */
  public zoomOut(): void {
    this.zoomLevel.update(z => Math.max(0.4, +(z - 0.15).toFixed(2)));
  }

  /**
   * Réinitialisation du zoom (100%)
   */
  public resetZoom(): void {
    this.zoomLevel.set(1);
    this.centerRootView();
  }

  /**
   * Déplier tous les nœuds de l'arborescence
   */
  public expandAll(): void {
    const nodes = this._dataSignal();
    const setExpanded = (list: SbdOrgTreeNode[]) => {
      for (const n of list) {
        n.expanded = true;
        if (n.children && n.children.length) {
          setExpanded(n.children);
        }
      }
    };
    setExpanded(nodes);
    this._dataSignal.set([...nodes]);
  }

  /**
   * Replier tous les nœuds (remet à l'état initial : seule la racine est visible)
   */
  public collapseAll(): void {
    const nodes = this._dataSignal();
    const setCollapsed = (list: SbdOrgTreeNode[]) => {
      for (const n of list) {
        n.expanded = false;
        if (n.children && n.children.length) {
          setCollapsed(n.children);
        }
      }
    };
    setCollapsed(nodes);
    this._dataSignal.set([...nodes]);
    setTimeout(() => this.centerRootView(), 50);
  }

  /**
   * Déplier uniquement le premier niveau sous la racine
   */
  public expandFirstLevel(): void {
    const nodes = this._dataSignal();
    for (const root of nodes) {
      root.expanded = true;
      if (root.children) {
        for (const child of root.children) {
          child.expanded = false;
        }
      }
    }
    this._dataSignal.set([...nodes]);
  }

  /**
   * Recentrer le scroll du conteneur sur la racine
   */
  public centerRootView(): void {
    const viewport = this.viewportRef()?.nativeElement;
    if (!viewport) return;

    const scrollLeft = (viewport.scrollWidth - viewport.clientWidth) / 2;
    if (typeof viewport.scrollTo === 'function') {
      viewport.scrollTo({
        left: Math.max(0, scrollLeft),
        top: 0,
        behavior: 'smooth'
      });
    } else {
      viewport.scrollLeft = Math.max(0, scrollLeft);
      viewport.scrollTop = 0;
    }
  }

  /**
   * Bascule Plein Écran
   */
  public toggleFullscreen(): void {
    this.isFullscreen.update(f => !f);
    setTimeout(() => this.centerRootView(), 150);
  }

  /**
   * Fermer le volet latéral de détails
   */
  public closeDetails(): void {
    this.selectedNode.set(null);
  }

  /**
   * Récupère le nombre d'enfants d'un nœud
   */
  public getChildrenCount(node: SbdOrgTreeNode): number {
    return node.children ? node.children.length : 0;
  }

  /**
   * Récupère le statut typé
   */
  public getNodeStatus(node: SbdOrgTreeNode): string {
    return node.data?.status || 'active';
  }
}
