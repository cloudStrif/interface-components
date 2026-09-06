import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { SbdTreeNode, SbdNodeActionEvent } from '../../models/file-tree.model';

@Component({
  selector: 'app-sbd-file-tree-node',
  standalone: true,
  imports: [CommonModule, SbdTreeNodeComponent],
  templateUrl: './sbd-file-tree-node.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SbdTreeNodeComponent<T = any> {
  @Input({ required: true }) node!: SbdTreeNode<T>;
  @Input() level: number = 0;
  @Input() selectedNodeId: string | null = null;
  @Input() nodeActions: Array<{ action: string; label: string; icon: string }> = [];

  @Output() nodeSelect = new EventEmitter<SbdTreeNode<T>>();
  @Output() nodeToggle = new EventEmitter<SbdTreeNode<T>>();
  @Output() nodeAction = new EventEmitter<SbdNodeActionEvent<T>>();

  public toggleFolder(event: MouseEvent): void {
    event.stopPropagation();
    if (this.node.type === 'folder') {
      this.node.isExpanded = !this.node.isExpanded;
      this.nodeToggle.emit(this.node);
    }
  }

  public onSelect(event: MouseEvent): void {
    event.stopPropagation();
    if (this.node.disabled) return;
    if (this.node.type === 'folder') {
      this.node.isExpanded = !this.node.isExpanded;
      this.nodeToggle.emit(this.node);
    }
    this.nodeSelect.emit(this.node);
  }

  public onAction(action: string, event: MouseEvent): void {
    event.stopPropagation();
    this.nodeAction.emit({ action, node: this.node, event });
  }
}
