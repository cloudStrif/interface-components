import {
  Component,
  Input,
  Output,
  EventEmitter,
  Signal,
  WritableSignal,
  signal,
  OnChanges,
  SimpleChanges,
  ChangeDetectionStrategy,
  inject,
  ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CdkTreeModule, NestedTreeControl } from '@angular/cdk/tree';
import { ArrayDataSource } from '@angular/cdk/collections';
import { SbdTreeNode, SbdNodeActionEvent } from '../../models/file-tree.model';

@Component({
  selector: 'app-sbd-cdk-file-tree',
  standalone: true,
  imports: [CommonModule, FormsModule, CdkTreeModule],
  templateUrl: './sbd-cdk-file-tree.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SbdCdkFileTreeComponent<T = any> implements OnChanges {
  private cdr = inject(ChangeDetectorRef);

  @Input() nodes: SbdTreeNode<T>[] = [];
  @Input() title: string = 'Arborescence (Angular CDK Tree)';
  @Input() searchable: boolean = true;
  @Input() selectedNodeId: string | null = null;
  @Input() nodeActions: Array<{ action: string; label: string; icon: string }> = [
    { action: 'download', label: 'Télécharger', icon: 'pi pi-download' },
    { action: 'open', label: 'Ouvrir', icon: 'pi pi-external-link' },
    { action: 'details', label: 'Détails', icon: 'pi pi-info-circle' }
  ];

  @Output() nodeSelect = new EventEmitter<SbdTreeNode<T>>();
  @Output() nodeToggle = new EventEmitter<SbdTreeNode<T>>();
  @Output() nodeAction = new EventEmitter<SbdNodeActionEvent<T>>();

  public searchQuery: WritableSignal<string> = signal('');

  // CDK Tree Control & Data Source
  public treeControl = new NestedTreeControl<SbdTreeNode<T>>(node => node.children);
  public dataSource = new ArrayDataSource<SbdTreeNode<T>>([]);

  public hasChild = (_: number, node: SbdTreeNode<T>): boolean =>
    node.type === 'folder' && !!node.children && node.children.length > 0;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['nodes']) {
      this.applyFilter();
      this.syncExpandedState(this.nodes);
    }
  }

  private syncExpandedState(nodes: SbdTreeNode<T>[]): void {
    nodes.forEach(node => {
      if (node.isExpanded) {
        this.treeControl.expand(node);
      }
      if (node.children) {
        this.syncExpandedState(node.children);
      }
    });
    this.cdr.markForCheck();
  }

  public onSearchInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.searchQuery.set(val);
    this.applyFilter();
  }

  public clearSearch(): void {
    this.searchQuery.set('');
    this.applyFilter();
  }

  private applyFilter(): void {
    const q = this.searchQuery().trim().toLowerCase();
    if (!q) {
      this.dataSource = new ArrayDataSource(this.nodes);
      this.cdr.markForCheck();
      return;
    }

    const filtered = this.filterNodes(this.nodes, q);
    this.dataSource = new ArrayDataSource(filtered);
    this.expandAllMatching(filtered);
    this.cdr.markForCheck();
  }

  private filterNodes(nodes: SbdTreeNode<T>[], query: string): SbdTreeNode<T>[] {
    return nodes.reduce<SbdTreeNode<T>[]>((acc, node) => {
      const nameMatch = node.name.toLowerCase().includes(query);
      const badgeMatch = (node.badge || node.extension || '').toLowerCase().includes(query);

      let filteredChildren: SbdTreeNode<T>[] = [];
      if (node.children && node.children.length > 0) {
        filteredChildren = this.filterNodes(node.children, query);
      }

      if (nameMatch || badgeMatch || filteredChildren.length > 0) {
        const clonedNode: SbdTreeNode<T> = {
          ...node,
          children: filteredChildren.length > 0 ? filteredChildren : node.children
        };
        acc.push(clonedNode);
      }
      return acc;
    }, []);
  }

  private expandAllMatching(nodes: SbdTreeNode<T>[]): void {
    nodes.forEach(node => {
      if (node.type === 'folder') {
        this.treeControl.expand(node);
        if (node.children) {
          this.expandAllMatching(node.children);
        }
      }
    });
  }

  public expandAll(): void {
    this.treeControl.expandAll();
    this.cdr.markForCheck();
  }

  public collapseAll(): void {
    this.treeControl.collapseAll();
    this.cdr.markForCheck();
  }

  public toggleNode(node: SbdTreeNode<T>, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.treeControl.toggle(node);
    this.nodeToggle.emit(node);
    this.cdr.markForCheck();
  }

  public onSelect(node: SbdTreeNode<T>, event: Event): void {
    event.stopPropagation();
    if (node.disabled) return;
    this.nodeSelect.emit(node);
    this.cdr.markForCheck();
  }

  public onAction(action: string, node: SbdTreeNode<T>, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.nodeAction.emit({
      action,
      node,
      event: event as MouseEvent
    });
  }

  public getBadgeColorClass(ext?: string, badgeColor?: string): string {
    if (badgeColor) {
      switch (badgeColor) {
        case 'cyan': return 'bg-sky-50 text-[#005B9E] border-sky-200';
        case 'green': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
        case 'amber': return 'bg-amber-50 text-amber-700 border-amber-200';
        case 'red': return 'bg-rose-50 text-rose-700 border-rose-200';
        case 'purple': return 'bg-purple-50 text-purple-700 border-purple-200';
        default: return 'bg-sky-50 text-[#00205B] border-sky-200';
      }
    }

    const extension = (ext || '').toLowerCase();
    switch (extension) {
      case 'pdf': return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'cad':
      case 'step':
      case 'stl': return 'bg-sky-50 text-[#005B9E] border-sky-200';
      case 'json':
      case 'yaml': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'log': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'zip':
      case 'tar': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'ts':
      case 'js': return 'bg-cyan-50 text-cyan-800 border-cyan-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  }

  public getFileIconType(node: SbdTreeNode<T>): string {
    if (node.icon) return node.icon;
    if (node.type === 'folder') {
      return this.treeControl.isExpanded(node) ? 'folder-open' : 'folder';
    }

    const ext = (node.extension || node.name.split('.').pop() || '').toLowerCase();
    switch (ext) {
      case 'pdf': return 'pdf';
      case 'cad':
      case 'step': return 'cog';
      case 'json':
      case 'yaml': return 'code';
      case 'log': return 'list';
      case 'zip': return 'box';
      case 'png':
      case 'jpg': return 'image';
      default: return 'file';
    }
  }

  public isHighlighted(name: string): boolean {
    const q = this.searchQuery();
    if (!q) return false;
    return name.toLowerCase().includes(q.toLowerCase());
  }
}
