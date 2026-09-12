import { Component, input, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { S3000LTreeNode, S3000LNodeType } from '../../models/s3000l-tree.model';
import { S3000LParserService } from '../../services/s3000l-parser.service';

@Component({
  selector: 'app-sbd-tree-node',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sbd-tree-node.component.html'
})
export class S3000LTreeNodeComponent {
  public node        = input.required<S3000LTreeNode>();
  public level       = input<number>(0);
  public filterQuery = input<string>('');

  public parserService = inject(S3000LParserService);

  // ─── Inline add-child form state ──────────────────────────────────────────
  public isAddingChild  = false;
  public newChildName   = '';

  // ─── Inline rename form state ─────────────────────────────────────────────
  public isRenaming     = false;
  public renameValue    = '';

  // ─── Confirm delete state ─────────────────────────────────────────────────
  public isConfirmingDelete = false;

  // ─── Expand / Select ──────────────────────────────────────────────────────
  public toggleExpand(event: MouseEvent, n: S3000LTreeNode): void {
    event.stopPropagation();
    n.expanded = !n.expanded;
  }

  public selectNode(n: S3000LTreeNode): void {
    this.parserService.selectedNode.set(n);
  }

  public isNodeSelected(n: S3000LTreeNode): boolean {
    return this.parserService.selectedNode()?.id === n.id;
  }

  // ─── Add child ────────────────────────────────────────────────────────────
  public openAddChild(event: MouseEvent): void {
    event.stopPropagation();
    this.isAddingChild  = true;
    this.isRenaming     = false;
    this.isConfirmingDelete = false;
    this.newChildName   = '';
    this.selectNode(this.node());
  }

  public confirmAddChild(event?: Event): void {
    event?.stopPropagation?.();
    if (!this.newChildName.trim()) return;
    this.parserService.addChildNode(this.node(), this.newChildName);
    this.isAddingChild = false;
    this.newChildName  = '';
  }

  public cancelAddChild(event?: Event): void {
    event?.stopPropagation?.();
    this.isAddingChild = false;
    this.newChildName  = '';
  }

  // ─── Rename ───────────────────────────────────────────────────────────────
  public openRename(event: MouseEvent): void {
    event.stopPropagation();
    this.isRenaming   = true;
    this.isAddingChild = false;
    this.isConfirmingDelete = false;
    this.renameValue  = this.node().name;
    this.selectNode(this.node());
  }

  public confirmRename(event?: Event): void {
    event?.stopPropagation?.();
    if (!this.renameValue.trim()) return;
    this.parserService.renameNode(this.node(), this.renameValue);
    this.isRenaming = false;
  }

  public cancelRename(event?: Event): void {
    event?.stopPropagation?.();
    this.isRenaming = false;
  }

  // ─── Delete ───────────────────────────────────────────────────────────────
  /** Root node (level 0) cannot be deleted. */
  public get canDelete(): boolean {
    return this.level() > 0;
  }

  public openConfirmDelete(event: MouseEvent): void {
    event.stopPropagation();
    this.isConfirmingDelete = true;
    this.isAddingChild  = false;
    this.isRenaming     = false;
  }

  public confirmDelete(event: MouseEvent): void {
    event.stopPropagation();
    this.parserService.deleteNode(this.node().id);
    this.isConfirmingDelete = false;
  }

  public cancelDelete(event: MouseEvent): void {
    event.stopPropagation();
    this.isConfirmingDelete = false;
  }

  // ─── Filter ───────────────────────────────────────────────────────────────
  public isMatchingFilter(n: S3000LTreeNode): boolean {
    const query = this.filterQuery().toLowerCase().trim();
    if (!query) return true;
    const hit =
      n.name.toLowerCase().includes(query) ||
      (n.lcn?.toLowerCase().includes(query) ?? false) ||
      n.tagName.toLowerCase().includes(query) ||
      (n.partNumber?.toLowerCase().includes(query) ?? false);
    if (hit) return true;
    return n.children?.some(c => this.isMatchingFilter(c)) ?? false;
  }

  // ─── Badge color per type ─────────────────────────────────────────────────
  public getNodeBadgeColor(type: string): string {
    switch (type) {
      case 'root':      return 'bg-blue-50 text-[#0055B8] border border-blue-200';
      case 'product':   return 'bg-sky-50 text-sky-700 border border-sky-200';
      case 'system':    return 'bg-indigo-50 text-indigo-700 border border-indigo-200';
      case 'subsystem': return 'bg-cyan-50 text-cyan-700 border border-cyan-200';
      case 'assembly':  return 'bg-purple-50 text-purple-700 border border-purple-200';
      case 'lci':       return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      case 'task':      return 'bg-amber-50 text-amber-700 border border-amber-200';
      case 'hardware':  return 'bg-slate-100 text-slate-700 border border-slate-200';
      default:          return 'bg-slate-100 text-slate-600 border border-slate-200';
    }
  }
}
