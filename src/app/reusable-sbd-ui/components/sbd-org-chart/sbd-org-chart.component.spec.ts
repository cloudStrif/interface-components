import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { SbdOrgChartComponent } from './sbd-org-chart.component';
import { SbdOrgTreeNode } from '../../../models/org-chart.model';
import { getFreshMockOrganizationChartData } from '../../../mock-data/mock-org-chart.data';

describe('SbdOrgChartComponent', () => {
  let component: SbdOrgChartComponent;
  let fixture: ComponentFixture<SbdOrgChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SbdOrgChartComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(SbdOrgChartComponent);
    component = fixture.componentInstance;
  });

  it('should create the component with initial state', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
    expect(component.zoomLevel()).toBe(1);
    expect(component.selectedNode()).toBeNull();
    expect(component.isFullscreen()).toBe(false);
  });

  it('should correctly initialize with all nodes collapsed (expanded: false)', () => {
    const data = getFreshMockOrganizationChartData();
    component.data = data;
    fixture.detectChanges();

    // Vérifier que la racine et chaque enfant est bien à expanded: false
    expect(data[0].expanded).toBe(false);
    expect(data[0].children?.[0].expanded).toBe(false);

    // Vérifier les statistiques
    const stats = component.treeStats();
    expect(stats.total).toBeGreaterThan(10);
    expect(stats.expanded).toBe(0);
  });

  it('should handle zoom in, zoom out and reset zoom', () => {
    component.zoomIn();
    expect(component.zoomLevel()).toBe(1.15);

    component.zoomIn();
    expect(component.zoomLevel()).toBe(1.3);

    component.zoomOut();
    expect(component.zoomLevel()).toBe(1.15);

    component.resetZoom();
    expect(component.zoomLevel()).toBe(1);
  });

  it('should expand and collapse all nodes', () => {
    const data = getFreshMockOrganizationChartData();
    component.data = data;
    fixture.detectChanges();

    // Tout déplier
    component.expandAll();
    expect(component.treeStats().expanded).toBe(component.treeStats().total);
    expect(data[0].expanded).toBe(true);

    // Tout replier
    component.collapseAll();
    expect(component.treeStats().expanded).toBe(0);
    expect(data[0].expanded).toBe(false);
  });

  it('should expand only the first level under root', () => {
    const data = getFreshMockOrganizationChartData();
    component.data = data;
    fixture.detectChanges();

    component.expandFirstLevel();
    expect(data[0].expanded).toBe(true);
    // Les enfants de la racine restent repliés
    expect(data[0].children?.[0].expanded).toBe(false);
  });

  it('should update selected node and compute breadcrumb', () => {
    const data = getFreshMockOrganizationChartData();
    component.data = data;
    fixture.detectChanges();

    const targetChild = data[0].children?.[0]; // SYS-PROP-01
    expect(targetChild).toBeDefined();

    component.onNodeSelected(targetChild);
    expect(component.selectedNode()).toBe(targetChild);

    const breadcrumbs = component.selectedNodeBreadcrumb();
    expect(breadcrumbs.length).toBe(2);
    expect(breadcrumbs[0]).toContain('M88-S3000L');
    expect(breadcrumbs[1]).toContain('Propulsion');
  });

  it('should close details panel', () => {
    const data = getFreshMockOrganizationChartData();
    component.selectedNode.set(data[0]);
    expect(component.selectedNode()).not.toBeNull();

    component.closeDetails();
    expect(component.selectedNode()).toBeNull();
  });
});
