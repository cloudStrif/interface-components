import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { S3000LParserService } from '../../services/s3000l-parser.service';
import { ProjectService } from '../../services/project.service';
import { S3000LTreeNodeComponent } from '../sbd-tree-node/sbd-tree-node.component';
import { S3000LNodeDetailComponent } from '../sbd-node-detail/sbd-node-detail.component';

@Component({
  selector: 'app-sbd-explorer',
  standalone: true,
  imports: [CommonModule, FormsModule, S3000LTreeNodeComponent, S3000LNodeDetailComponent],
  templateUrl: './sbd-explorer.component.html'
})
export class S3000LExplorerComponent implements OnInit {
  public parserService = inject(S3000LParserService);
  public projectService = inject(ProjectService);

  public filterQuery = '';
  public isDraggingFile = false;
  public errorMessage = '';

  ngOnInit(): void {
    // Load initial sample engine data by default
    if (!this.parserService.currentTree()) {
      this.parserService.loadSampleData('engine');
    }
  }

  public onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.processXmlFile(input.files[0]);
    }
  }

  public onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDraggingFile = true;
  }

  public onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDraggingFile = false;
  }

  public onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDraggingFile = false;
    if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
      this.processXmlFile(event.dataTransfer.files[0]);
    }
  }

  private processXmlFile(file: File): void {
    this.errorMessage = '';
    this.parserService.parseXmlFile(file).catch(err => {
      this.errorMessage = `Erreur lors de la lecture du fichier S3000L : ${err.message}`;
    });
  }

  public loadSample(sample: 'engine' | 'landing_gear' | 'avionics'): void {
    this.errorMessage = '';
    this.parserService.loadSampleData(sample);
  }

  public expandAllNodes(): void {
    const tree = this.parserService.currentTree();
    if (tree) {
      this.setExpandRecursive(tree, true);
    }
  }

  public collapseAllNodes(): void {
    const tree = this.parserService.currentTree();
    if (tree) {
      this.setExpandRecursive(tree, false);
      tree.expanded = true; // keep root expanded
    }
  }

  private setExpandRecursive(node: any, expanded: boolean): void {
    node.expanded = expanded;
    if (node.children) {
      node.children.forEach((c: any) => this.setExpandRecursive(c, expanded));
    }
  }
}
