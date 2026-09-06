import {
  Component,
  Input,
  Output,
  EventEmitter,
  Signal,
  WritableSignal,
  signal,
  computed,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SbdTreeNode, SbdNodeActionEvent } from '../../models/file-tree.model';
import { SbdTreeNodeComponent } from './sbd-file-tree-node.component';

@Component({
  selector: 'app-sbd-file-tree',
  standalone: true,
  imports: [CommonModule, FormsModule, SbdTreeNodeComponent],
  templateUrl: './sbd-file-tree.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SbdFileTreeComponent<T = any> {
  private _nodesSignal: WritableSignal<SbdTreeNode<T>[]> = signal([]);

  @Input() set nodes(val: SbdTreeNode<T>[]) {
    this._nodesSignal.set(val || []);
  }
  get nodes(): SbdTreeNode<T>[] {
    return this._nodesSignal();
  }

  @Input() title: string = 'Arborescence des Fichiers';
  @Input() searchable: boolean = true;
  @Input() selectedNodeId: string | null = null;
  @Input() nodeActions: Array<{ action: string; label: string; icon: string }> = [];

  @Output() nodeSelect = new EventEmitter<SbdTreeNode<T>>();
  @Output() nodeToggle = new EventEmitter<SbdTreeNode<T>>();
  @Output() nodeAction = new EventEmitter<SbdNodeActionEvent<T>>();

  public searchQuery: WritableSignal<string> = signal('');

  public filteredNodes: Signal<SbdTreeNode<T>[]> = computed(() => {
    const rawNodes = this._nodesSignal();
    const query = this.searchQuery().trim().toLowerCase();
    if (!query) return rawNodes;
    return this.filterTreeNodes(rawNodes, query);
  });

  public onSearchInput(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  private filterTreeNodes(nodes: SbdTreeNode<T>[], query: string): SbdTreeNode<T>[] {
    return nodes.reduce<SbdTreeNode<T>[]>((acc, node) => {
      const match = node.name.toLowerCase().includes(query);
      let filteredChildren: SbdTreeNode<T>[] = [];
      if (node.children && node.children.length > 0) {
        filteredChildren = this.filterTreeNodes(node.children, query);
      }
      if (match || filteredChildren.length > 0) {
        acc.push({
          ...node,
          isExpanded: filteredChildren.length > 0 ? true : (node.isExpanded ?? true),
          children: filteredChildren.length > 0 ? filteredChildren : node.children
        });
      }
      return acc;
    }, []);
  }
}
