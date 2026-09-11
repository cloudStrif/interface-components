import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { S3000LParserService } from '../../services/s3000l-parser.service';
import { S3000LTreeNode } from '../../models/s3000l-tree.model';

@Component({
  selector: 'app-sbd-node-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sbd-node-detail.component.html'
})
export class S3000LNodeDetailComponent {
  public parserService = inject(S3000LParserService);

  public activeTab: 'general' | 'attributes' | 'maintenance' | 'xml' = 'general';
  public copiedXml = false;

  public copyXmlSnippet(snippet?: string): void {
    if (!snippet) return;
    navigator.clipboard.writeText(snippet);
    this.copiedXml = true;
    setTimeout(() => {
      this.copiedXml = false;
    }, 2000);
  }
}
