import { Component, input, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { S3000LTreeNode } from '../../models/s3000l-tree.model';
import { S3000LParserService } from '../../services/s3000l-parser.service';

@Component({
  selector: 'app-sbd-tree-node',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sbd-tree-node.component.html'
})
export class S3000LTreeNodeComponent {
  public node = input.required<S3000LTreeNode>();
  public level = input<number>(0);
  public filterQuery = input<string>('');

  public parserService = inject(S3000LParserService);

  public toggleExpand(event: MouseEvent, n: S3000LTreeNode): void {
    event.stopPropagation();
    n.expanded = !n.expanded;
  }

  public selectNode(n: S3000LTreeNode): void {
    this.parserService.selectedNode.set(n);
  }

  public isNodeSelected(n: S3000LTreeNode): boolean {
    const sel = this.parserService.selectedNode();
    return sel?.id === n.id;
  }

  public isMatchingFilter(n: S3000LTreeNode): boolean {
    const query = this.filterQuery().toLowerCase().trim();
    if (!query) return true;
    
    const nameMatch = n.name.toLowerCase().includes(query);
    const lcnMatch = n.lcn?.toLowerCase().includes(query) ?? false;
    const tagMatch = n.tagName.toLowerCase().includes(query);
    const pnMatch = n.partNumber?.toLowerCase().includes(query) ?? false;

    if (nameMatch || lcnMatch || tagMatch || pnMatch) return true;

    // Check recursive children
    return n.children?.some(c => this.isMatchingFilter(c)) ?? false;
  }

  public getNodeBadgeColor(type: string): string {
    switch (type) {
      case 'root': return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
      case 'product': return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
      case 'system': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'subsystem': return 'bg-teal-500/20 text-teal-300 border-teal-500/30';
      case 'assembly': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'lci': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'task': return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'hardware': return 'bg-slate-700/50 text-slate-300 border-slate-600/30';
      default: return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  }
}
