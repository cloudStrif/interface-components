import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  WritableSignal,
  signal,
  computed
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SbdOrgChartComponent } from '../../reusable-sbd-ui/components/sbd-org-chart/sbd-org-chart.component';
import { SbdOrgTreeNode } from '../../models/org-chart.model';
import {
  MOCK_ORGANIZATION_CHART_DATA,
  getFreshMockOrganizationChartData
} from '../../mock-data/mock-org-chart.data';

@Component({
  selector: 'app-org-chart-demo',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, SbdOrgChartComponent],
  templateUrl: './org-chart-demo.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrgChartDemoComponent implements OnInit {
  /** Données hiérarchiques mock avec tous les nœuds à expanded: false */
  public readonly chartData: WritableSignal<SbdOrgTreeNode[]> = signal([]);

  /** Nœud actif inspecté */
  public readonly selectedNode: WritableSignal<SbdOrgTreeNode | null> = signal(null);

  /** Affichage de l'inspecteur JSON brut */
  public readonly showJsonModal: WritableSignal<boolean> = signal(false);

  /** JSON formaté pour affichage */
  public readonly formattedJson: WritableSignal<string> = signal('');

  ngOnInit(): void {
    this.resetData();
  }

  /**
   * Réinitialise les données avec tous les nœuds repliés (expanded: false)
   */
  public resetData(): void {
    const data = getFreshMockOrganizationChartData();
    this.chartData.set(data);
    this.selectedNode.set(null);
    this.formattedJson.set(JSON.stringify(data, null, 2));
  }

  /**
   * Événement de sélection de nœud
   */
  public onNodeSelected(node: SbdOrgTreeNode): void {
    this.selectedNode.set(node);
  }

  /**
   * Ouvrir l'inspecteur JSON
   */
  public openJsonViewer(): void {
    this.formattedJson.set(JSON.stringify(this.chartData(), null, 2));
    this.showJsonModal.set(true);
  }

  /**
   * Fermer l'inspecteur JSON
   */
  public closeJsonViewer(): void {
    this.showJsonModal.set(false);
  }

  /**
   * Copier le JSON dans le presse-papier
   */
  public copyJsonToClipboard(): void {
    navigator.clipboard?.writeText(this.formattedJson());
  }
}
