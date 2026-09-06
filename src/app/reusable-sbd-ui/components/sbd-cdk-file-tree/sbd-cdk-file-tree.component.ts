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
  @Input() nodeActions: Array<{ action: string; label: string; icon: string }> = [];

  @Output() nodeSelect = new EventEmitter<SbdTreeNode<T>>();
  @Output() nodeToggle = new EventEmitter<SbdTreeNode<T>>();
  @Output() nodeAction = new EventEmitter<SbdNodeActionEvent<T>>();

  public searchQuery: WritableSignal<string> = signal('');

  public treeControl = new NestedTreeControl<SbdTreeNode<T>>(node => node.children);
  public dataSource = new ArrayDataSource<SbdTreeNode<T>>([]);

  public hasChild = (_: number, node: SbdTreeNode<T>): boolean =>
    node.type === 'folder' && !!node.children && node.children.length > 0;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['nodes']) {
      this.applyFilter();
    }
  }

  public onSearchInput(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
    this.applyFilter();
  }

  private applyFilter(): void {
    const q = this.searchQuery().trim().toLowerCase();
    if (!q) {
      this.dataSource = new ArrayDataSource(this.nodes);
    } else {
      const filtered = this.filterNodes(this.nodes, q);
      this.dataSource = new ArrayDataSource(filtered);
      this.expandMatchingFolders(filtered);
    }
    this.cdr.markForCheck();
  }

  private filterNodes(nodes: SbdTreeNode<T>[], query: string): SbdTreeNode<T>[] {
    return nodes.reduce<SbdTreeNode<T>[]>((acc, node) => {
      const match = node.name.toLowerCase().includes(query);
      let children: SbdTreeNode<T>[] = [];
      if (node.children && node.children.length > 0) {
        children = this.filterNodes(node.children, query);
      }
      if (match || children.length > 0) {
        acc.push({
          ...node,
          children: children.length > 0 ? children : node.children
        });
      }
      return acc;
    }, []);
  }

  private expandMatchingFolders(nodes: SbdTreeNode<T>[]): void {
    nodes.forEach(node => {
      if (node.type === 'folder') {
        this.treeControl.expand(node);
        if (node.children) this.expandMatchingFolders(node.children);
      }
    });
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
}
