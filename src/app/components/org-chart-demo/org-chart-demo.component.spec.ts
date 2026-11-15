import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, it, expect, beforeEach } from 'vitest';
import { OrgChartDemoComponent } from './org-chart-demo.component';

describe('OrgChartDemoComponent', () => {
  let component: OrgChartDemoComponent;
  let fixture: ComponentFixture<OrgChartDemoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrgChartDemoComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(OrgChartDemoComponent);
    component = fixture.componentInstance;
  });

  it('should create the demo page component', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
    expect(component.chartData().length).toBeGreaterThan(0);
  });

  it('should reset data with all nodes collapsed', () => {
    fixture.detectChanges();
    component.resetData();
    const data = component.chartData();
    expect(data[0].expanded).toBe(false);
    expect(data[0].children?.[0].expanded).toBe(false);
  });

  it('should toggle JSON modal viewer', () => {
    fixture.detectChanges();
    expect(component.showJsonModal()).toBe(false);

    component.openJsonViewer();
    expect(component.showJsonModal()).toBe(true);
    expect(component.formattedJson()).toContain('Aéronef Polyvalent M88-S3000L');

    component.closeJsonViewer();
    expect(component.showJsonModal()).toBe(false);
  });

  it('should update selected node when onNodeSelected is called', () => {
    fixture.detectChanges();
    const mockNode = component.chartData()[0];
    component.onNodeSelected(mockNode);
    expect(component.selectedNode()).toBe(mockNode);
  });
});
