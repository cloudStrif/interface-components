import {
  Component,
  Input,
  Output,
  EventEmitter,
  Signal,
  WritableSignal,
  signal,
  computed,
  effect,
  HostListener,
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
  public readonly currentSearchIndex: WritableSignal<number> = signal(0);
  public readonly isSearchDropdownOpen: WritableSignal<boolean> = signal(false);
  public readonly highlightedNodeKey: WritableSignal<string | null> = signal(null);

  /**
   * Liste réactive des nœuds correspondant à la recherche courante
   */
  public readonly searchResults: Signal<SbdOrgTreeNode[]> = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    if (!query) return [];

    const rootNodes = this._dataSignal();
    const results: SbdOrgTreeNode[] = [];

    const searchRecursive = (nodes: SbdOrgTreeNode[]) => {
      for (const n of nodes) {
        const label = (n.label || '').toLowerCase();
        const code = (n.data?.code || '').toLowerCase();
        const title = (n.data?.title || '').toLowerCase();
        const desc = (n.data?.description || '').toLowerCase();
        const manager = (n.data?.manager || '').toLowerCase();
        const dept = (n.data?.department || '').toLowerCase();
        const cat = (n.data?.category || '').toLowerCase();
        const key = (n.key || '').toLowerCase();

        if (
          label.includes(query) ||
          code.includes(query) ||
          title.includes(query) ||
          desc.includes(query) ||
          manager.includes(query) ||
          dept.includes(query) ||
          cat.includes(query) ||
          key.includes(query)
        ) {
          results.push(n);
        }

        if (n.children && n.children.length > 0) {
          searchRecursive(n.children);
        }
      }
    };

    searchRecursive(rootNodes);
    return results;
  });

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
    const targetId = this.getNodeIdentifier(selected);

    const findPath = (nodes: SbdOrgTreeNode[]): boolean => {
      for (const n of nodes) {
        path.push(n.label || n.data?.title || 'Nœud');
        if (this.getNodeIdentifier(n) === targetId || n === selected) {
          return true;
        }
        if (n.children && n.children.length) {
          if (findPath(n.children)) return true;
        }
        path.pop();
      }
      return false;
    };

    findPath(rootNodes);
    return path;
  });

  /**
   * Chemin complet sous forme de chaîne de caractères : obj1 / obj2 / obj3
   */
  public readonly selectedNodePathString: Signal<string> = computed(() => {
    const breadcrumb = this.selectedNodeBreadcrumb();
    if (!breadcrumb || breadcrumb.length === 0) return '';
    return breadcrumb.join(' / ');
  });

  /**
   * État de copie du chemin dans le presse-papier
   */
  public readonly isPathCopied: WritableSignal<boolean> = signal(false);

  /**
   * Ensemble des identifiants uniques des nœuds du chemin complet menant de la racine à la cible
   */
  public readonly activePathNodeKeys: Signal<Set<string>> = computed(() => {
    const selected = this.selectedNode();
    if (!selected) return new Set<string>();

    const rootNodes = this._dataSignal();
    const pathKeys = new Set<string>();
    const targetId = this.getNodeIdentifier(selected);

    const collectPath = (nodes: SbdOrgTreeNode[]): boolean => {
      for (const n of nodes) {
        const id = this.getNodeIdentifier(n);
        if (id === targetId || n === selected) {
          pathKeys.add(id);
          return true;
        }
        if (n.children && n.children.length > 0) {
          if (collectPath(n.children)) {
            pathKeys.add(id);
            return true;
          }
        }
      }
      return false;
    };

    collectPath(rootNodes);
    return pathKeys;
  });

  /**
   * Séquence ordonnée des nœuds du chemin complet de la racine jusqu'au nœud cible
   */
  public readonly activePathNodesSequence: Signal<SbdOrgTreeNode[]> = computed(() => {
    const selected = this.selectedNode();
    if (!selected) return [];

    const rootNodes = this._dataSignal();
    const sequence: SbdOrgTreeNode[] = [];
    const targetId = this.getNodeIdentifier(selected);

    const findSequence = (nodes: SbdOrgTreeNode[]): boolean => {
      for (const n of nodes) {
        sequence.push(n);
        if (this.getNodeIdentifier(n) === targetId || n === selected) {
          return true;
        }
        if (n.children && n.children.length > 0) {
          if (findSequence(n.children)) return true;
        }
        sequence.pop();
      }
      return false;
    };

    findSequence(rootNodes);
    return sequence;
  });

  /**
   * Tracés vectoriels SVG précis pour le tracé lumineux du chemin actif
   */
  public readonly activeSvgPaths: WritableSignal<string[]> = signal([]);

  constructor() {
    effect(() => {
      // Dépendance réactive à la séquence ordonnée des nœuds du chemin et au zoom
      this.activePathNodesSequence();
      this.zoomLevel();
      setTimeout(() => {
        this.updatePathLines();
      }, 50);
    });
  }

  @HostListener('window:resize')
  public onWindowResize(): void {
    this.updatePathLines();
  }

  ngAfterViewInit(): void {
    // Recentrer la vue sur la racine et tracer les lignes au premier chargement
    setTimeout(() => {
      this.centerRootView();
      this.updatePathLines();
    }, 120);
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
      setTimeout(() => this.updatePathLines(), 60);
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
      setTimeout(() => this.updatePathLines(), 60);
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
    setTimeout(() => this.updatePathLines(), 80);
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
    setTimeout(() => {
      this.centerRootView();
      this.updatePathLines();
    }, 60);
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

  /**
   * Mise à jour fluide de la saisie de recherche (sans lag ni blocage)
   */
  public onSearchInput(val: string): void {
    this.searchQuery.set(val);
    this.currentSearchIndex.set(0);
    this.isSearchDropdownOpen.set(val.trim().length > 0);

    if (!val.trim()) {
      this.highlightedNodeKey.set(null);
    }
  }

  /**
   * Validation via la touche Entrée dans l'input de recherche
   */
  public onSearchEnter(event: Event): void {
    event.preventDefault();
    const results = this.searchResults();
    if (!results.length) return;

    const keyboardEvent = event as KeyboardEvent;
    if (keyboardEvent.shiftKey) {
      this.prevSearchResult();
    } else if (!this.highlightedNodeKey()) {
      // Premier appui sur Entrée : naviguer directement vers le premier résultat trouvé
      this.currentSearchIndex.set(0);
      this.goToNode(results[0], true);
    } else {
      this.nextSearchResult();
    }
  }

  /**
   * Aller au résultat de recherche suivant
   */
  public nextSearchResult(): void {
    const results = this.searchResults();
    if (!results.length) return;

    const nextIndex = (this.currentSearchIndex() + 1) % results.length;
    this.currentSearchIndex.set(nextIndex);
    this.goToNode(results[nextIndex], true);
  }

  /**
   * Aller au résultat de recherche précédent
   */
  public prevSearchResult(): void {
    const results = this.searchResults();
    if (!results.length) return;

    const prevIndex = (this.currentSearchIndex() - 1 + results.length) % results.length;
    this.currentSearchIndex.set(prevIndex);
    this.goToNode(results[prevIndex], true);
  }

  /**
   * Effacer la recherche
   */
  public clearSearch(): void {
    this.searchQuery.set('');
    this.currentSearchIndex.set(0);
    this.isSearchDropdownOpen.set(false);
    this.highlightedNodeKey.set(null);
    setTimeout(() => this.updatePathLines(), 50);
  }

  /**
   * Déplie automatiquement l'arborescence jusqu'au nœud, le sélectionne et scrolle dessus avec fluidité
   */
  public goToNode(node: SbdOrgTreeNode, closeDropdown = true): void {
    if (!node) return;

    if (closeDropdown) {
      this.isSearchDropdownOpen.set(false);
    }

    // 1. Déplier tous les ancêtres depuis la racine
    const ancestors = this.findAncestors(this._dataSignal(), node);
    if (ancestors && ancestors.length > 0) {
      let changed = false;
      for (const ancestor of ancestors) {
        if (!ancestor.expanded) {
          ancestor.expanded = true;
          changed = true;
        }
      }
      if (changed) {
        // Rafraîchir le signal pour déclencher l'affichage des nœuds enfants dans le DOM
        this._dataSignal.set([...this._dataSignal()]);
      }
    }

    // 2. Sélectionner le nœud
    this.selectedNode.set(node);
    this.nodeSelect.emit(node);

    // 3. Activer la surbrillance dorée
    const nodeKey = this.getNodeIdentifier(node);
    this.highlightedNodeKey.set(nodeKey);

    // 4. Centrer la vue (smooth scroll) sur le nœud ciblé après rendu DOM et recalculer le tracé SVG
    setTimeout(() => {
      this.scrollToNodeElement(nodeKey);
      this.updatePathLines();
    }, 120);

    // 5. Retirer la surbrillance après 4 secondes
    setTimeout(() => {
      if (this.highlightedNodeKey() === nodeKey) {
        this.highlightedNodeKey.set(null);
      }
    }, 4000);
  }

  /**
   * Défilement automatique fluide et centré vers le nœud dans le viewport
   */
  private scrollToNodeElement(nodeKey: string): void {
    if (!nodeKey) return;

    const viewport = this.viewportRef()?.nativeElement;
    const targetElement = document.getElementById('org-node-' + nodeKey)
      || (viewport ? viewport.querySelector(`[data-node-key="${nodeKey}"]`) as HTMLElement : null);

    if (!targetElement) return;

    if (viewport) {
      const viewportRect = viewport.getBoundingClientRect();
      const elRect = targetElement.getBoundingClientRect();

      const scrollLeft = viewport.scrollLeft + (elRect.left - viewportRect.left) - (viewportRect.width / 2) + (elRect.width / 2);
      const scrollTop = viewport.scrollTop + (elRect.top - viewportRect.top) - (viewportRect.height / 2) + (elRect.height / 2);

      if (typeof viewport.scrollTo === 'function') {
        viewport.scrollTo({
          left: Math.max(0, scrollLeft),
          top: Math.max(0, scrollTop),
          behavior: 'smooth'
        });
      } else {
        viewport.scrollLeft = Math.max(0, scrollLeft);
        viewport.scrollTop = Math.max(0, scrollTop);
      }
    } else {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
    }
  }

  /**
   * Trouve la lignée d'ancêtres d'un nœud dans la hiérarchie
   */
  private findAncestors(
    nodes: SbdOrgTreeNode[],
    target: SbdOrgTreeNode,
    currentPath: SbdOrgTreeNode[] = []
  ): SbdOrgTreeNode[] | null {
    for (const node of nodes) {
      if (node === target || this.getNodeIdentifier(node) === this.getNodeIdentifier(target)) {
        return currentPath;
      }
      if (node.children && node.children.length > 0) {
        const found = this.findAncestors(node.children, target, [...currentPath, node]);
        if (found) return found;
      }
    }
    return null;
  }

  /**
   * Récupère l'identifiant unique du nœud
   */
  public getNodeIdentifier(node: SbdOrgTreeNode): string {
    return node.key || node.data?.code || node.data?.id || node.label || '';
  }

  /**
   * Vérifie si le nœud est actuellement ciblé par la recherche
   */
  public isNodeHighlighted(node: SbdOrgTreeNode): boolean {
    const current = this.highlightedNodeKey();
    if (!current) return false;
    return current === this.getNodeIdentifier(node);
  }

  /**
   * Vérifie si le nœud fait partie des résultats de la recherche courante
   */
  public isNodeInSearchResults(node: SbdOrgTreeNode): boolean {
    const query = this.searchQuery().trim();
    if (!query) return false;
    const key = this.getNodeIdentifier(node);
    return this.searchResults().some(r => this.getNodeIdentifier(r) === key);
  }

  /**
   * Vérifie si un nœud fait partie du chemin menant de la racine au nœud actif
   */
  public isNodeInActivePath(node: SbdOrgTreeNode): boolean {
    const pathKeys = this.activePathNodeKeys();
    if (!pathKeys.size) return false;
    return pathKeys.has(this.getNodeIdentifier(node));
  }

  /**
   * Vérifie si le nœud est un ancêtre sur le chemin actif (nœuds du chemin au-dessus du nœud cible)
   */
  public isNodeAncestorInPath(node: SbdOrgTreeNode): boolean {
    if (!this.isNodeInActivePath(node)) return false;
    const selected = this.selectedNode();
    if (!selected) return false;
    return this.getNodeIdentifier(node) !== this.getNodeIdentifier(selected);
  }

  /**
   * Retourne les classes CSS dynamiques Tailwind pour la carte du nœud.
   * La carte cible est mise en valeur, tandis que les cartes ancêtres restent sobres
   * afin de laisser le CHEMIN (les connecteurs de l'arbre) en jaune être l'élément visuel principal.
   */
  public getNodeCardClasses(node: SbdOrgTreeNode): string {
    const isTarget = this.isNodeHighlighted(node) || (this.selectedNode() === node && this.isNodeInActivePath(node));
    if (isTarget) {
      return 'ring-4 ring-amber-500 ring-offset-2 border-amber-500 bg-amber-50/70 scale-105 shadow-xl';
    }
    if (this.isNodeAncestorInPath(node)) {
      // Nœud ancêtre : la carte reste sobre et nette car c'est le CHEMIN (les connecteurs) qui est coloré
      return 'border-amber-300 bg-white shadow-xs';
    }
    if (this.selectedNode()?.key === node.key) {
      return 'ring-2 ring-indigo-600 border-indigo-600 shadow-md';
    }
    if (this.isNodeInSearchResults(node)) {
      return 'border-indigo-400 bg-indigo-50/20';
    }
    return 'border-slate-200';
  }

  /**
   * Calcule les tracés vectoriels SVG reliant géométriquement chaque parent à son enfant
   * le long du chemin hiérarchique menant de la racine à la cible.
   */
  public updatePathLines(): void {
    const stage = this.stageRef()?.nativeElement;
    if (!stage) {
      this.activeSvgPaths.set([]);
      return;
    }

    const sequence = this.activePathNodesSequence();
    if (!sequence || sequence.length <= 1) {
      this.activeSvgPaths.set([]);
      return;
    }

    const stageRect = stage.getBoundingClientRect();
    const zoom = this.zoomLevel() || 1;
    const paths: string[] = [];

    for (let i = 0; i < sequence.length - 1; i++) {
      const parent = sequence[i];
      const child = sequence[i + 1];

      const parentEl = document.getElementById('org-node-' + this.getNodeIdentifier(parent));
      const childEl = document.getElementById('org-node-' + this.getNodeIdentifier(child));

      if (!parentEl || !childEl) continue;

      const pRect = parentEl.getBoundingClientRect();
      const cRect = childEl.getBoundingClientRect();

      // Coordonnées en pixels non zoomés dans le repère de `#stage`
      const x1 = Math.round((pRect.left + pRect.width / 2 - stageRect.left) / zoom);
      const y1 = Math.round((pRect.bottom - stageRect.top) / zoom);

      const x2 = Math.round((cRect.left + cRect.width / 2 - stageRect.left) / zoom);
      const y2 = Math.round((cRect.top - stageRect.top) / zoom);

      // Palier horizontal exactement au milieu de l'interstice vertical reliant parent et enfant
      const yMid = Math.round(y1 + (y2 - y1) / 2);

      if (Math.abs(x1 - x2) < 4) {
        // Descente verticale directe
        paths.push(`M ${x1} ${y1} L ${x1} ${y2}`);
      } else {
        // Tracé orthogonal en marche d'escalier fluide avec congés de raccordement arrondis
        const r = Math.min(12, Math.abs(x1 - x2) / 2, Math.max(2, Math.abs(yMid - y1) - 2));
        const dir = x2 > x1 ? 1 : -1;
        paths.push(
          `M ${x1} ${y1} ` +
          `L ${x1} ${yMid - r} ` +
          `Q ${x1} ${yMid} ${x1 + dir * r} ${yMid} ` +
          `L ${x2 - dir * r} ${yMid} ` +
          `Q ${x2} ${yMid} ${x2} ${yMid + r} ` +
          `L ${x2} ${y2}`
        );
      }
    }

    this.activeSvgPaths.set(paths);
  }

  /**
   * Copie la chaîne textuelle du chemin dans le presse-papier
   */
  public copyPathToClipboard(): void {
    const text = this.selectedNodePathString();
    if (!text) return;
    navigator.clipboard?.writeText(text);
    this.isPathCopied.set(true);
    setTimeout(() => this.isPathCopied.set(false), 2000);
  }

  /**
   * Calcule le chemin textuel complet pour n'importe quel nœud (utilisé dans la liste des résultats)
   */
  public getNodePathString(node: SbdOrgTreeNode): string {
    const rootNodes = this._dataSignal();
    const path: string[] = [];
    const targetId = this.getNodeIdentifier(node);

    const find = (nodes: SbdOrgTreeNode[]): boolean => {
      for (const n of nodes) {
        path.push(n.label || n.data?.title || 'Nœud');
        if (this.getNodeIdentifier(n) === targetId || n === node) {
          return true;
        }
        if (n.children && n.children.length) {
          if (find(n.children)) return true;
        }
        path.pop();
      }
      return false;
    };

    find(rootNodes);
    return path.join(' / ');
  }
}
