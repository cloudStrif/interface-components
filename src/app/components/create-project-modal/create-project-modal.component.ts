import { Component, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProjectService } from '../../services/project.service';
import { S3000LVersion } from '../../models/project.model';

@Component({
  selector: 'app-create-project-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-project-modal.component.html'
})
export class CreateProjectModalComponent {
  private projectService = inject(ProjectService);

  public closeModal = output<void>();

  // 2 Form Fields as specified by prompt
  public projectName = '';
  public s3000lVersion: S3000LVersion = '2.0';

  public versionOptions: S3000LVersion[] = ['1.1', '2.0'];

  public onSubmit(): void {
    if (!this.projectName.trim()) return;

    this.projectService.createProject(this.projectName, this.s3000lVersion);
    this.closeModal.emit();
  }

  public onClose(): void {
    this.closeModal.emit();
  }
}
