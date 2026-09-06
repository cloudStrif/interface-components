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
  @Input() searchQuery: string = '';
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
    this.nodeAction.emit({
      action,
      node: this.node,
      event
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
      return node.isExpanded ? 'folder-open' : 'folder';
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
    if (!this.searchQuery) return false;
    return name.toLowerCase().includes(this.searchQuery.toLowerCase());
  }
}
