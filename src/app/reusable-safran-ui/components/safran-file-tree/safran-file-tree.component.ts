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
import { SafranTreeNode, SafranNodeActionEvent } from '../../models/file-tree.model';
import { SafranTreeNodeComponent } from './safran-file-tree-node.component';

@Component({
  selector: 'app-safran-file-tree',
  standalone: true,
  imports: [CommonModule, FormsModule, SafranTreeNodeComponent],
  templateUrl: './safran-file-tree.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SafranFileTreeComponent<T = any> {
  @Input() nodes: SafranTreeNode<T>[] = [];
  @Input() title: string = 'Arborescence des Fichiers';
  @Input() searchable: boolean = true;
  @Input() selectedNodeId: string | null = null;
  @Input() nodeActions: Array<{ action: string; label: string; icon: string }> = [
    { action: 'download', label: 'Télécharger', icon: 'pi pi-download' },
    { action: 'open', label: 'Ouvrir', icon: 'pi pi-external-link' },
    { action: 'details', label: 'Détails', icon: 'pi pi-[#009CDE] pi-info-circle' }
  ];

  @Output() nodeSelect = new EventEmitter<SafranTreeNode<T>>();
  @Output() nodeToggle = new EventEmitter<SafranTreeNode<T>>();
  @Output() nodeAction = new EventEmitter<SafranNodeActionEvent<T>>();

  public searchQuery: WritableSignal<string> = signal('');

  public onSearchInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.searchQuery.set(val);
    if (val.trim()) {
      this.expandMatchingNodes(this.nodes, val.toLowerCase());
    }
  }

  public expandAll(): void {
    this.setExpandState(this.nodes, true);
  }

  public collapseAll(): void {
    this.setExpandState(this.nodes, false);
  }

  private setExpandState(nodes: SafranTreeNode<T>[], state: boolean): void {
    nodes.forEach(node => {
      if (node.type === 'folder') {
        node.isExpanded = state;
        if (node.children) {
          this.setExpandState(node.children, state);
        }
      }
    });
  }

  private expandMatchingNodes(nodes: SafranTreeNode<T>[], query: string): boolean {
    let hasMatch = false;
    nodes.forEach(node => {
      let childMatch = false;
      if (node.children && node.children.length > 0) {
        childMatch = this.expandMatchingNodes(node.children, query);
      }
      const selfMatch = node.name.toLowerCase().includes(query);
      if (selfMatch || childMatch) {
        hasMatch = true;
        if (node.type === 'folder') {
          node.isExpanded = true;
        }
      }
    });
    return hasMatch;
  }
}
