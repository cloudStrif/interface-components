import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SimpleChange } from '@angular/core';
import { describe, it, expect, beforeEach } from 'vitest';
import { SbdDropdownComponent } from './sbd-dropdown.component';
import { SbdDropdownOption, SbdDropdownAdapter } from '../../models/dropdown.model';

interface TestItem {
  id: string | number;
  name: string;
  category?: string;
  tag?: string;
  iconName?: string;
}

describe('SbdDropdownComponent', () => {
  let component: SbdDropdownComponent<TestItem>;
  let fixture: ComponentFixture<SbdDropdownComponent<TestItem>>;

  const mockItems: TestItem[] = [
    { id: '1', name: 'Alpha Project', category: 'Engineering', tag: 'Active', iconName: 'folder' },
    { id: '2', name: 'Beta Project', category: 'Research', tag: 'Pending', iconName: 'flask' },
    { id: '3', name: 'Gamma System', category: 'Support', tag: 'Archived', iconName: 'archive' }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SbdDropdownComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(SbdDropdownComponent<TestItem>);
    component = fixture.componentInstance;
  });

  it('should create the dropdown component with default properties', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
    expect(component.isOpen()).toBe(false);
    expect(component.searchQuery()).toBe('');
    expect(component.selectedOption()).toBeNull();
    expect(component.searchable).toBe(true);
    expect(component.clearable).toBe(true);
    expect(component.loading).toBe(false);
    expect(component.disabled).toBe(false);
    expect(component.placeholder).toBe('Sélectionner une option...');
  });

  describe('adaptedOptions computation', () => {
    it('should return empty array if items is empty or undefined', () => {
      component.items = [];
      expect(component.adaptedOptions()).toEqual([]);
    });

    it('should map items with default key mappings (labelKey: label, valueKey: id)', () => {
      const itemsWithDefaults = [
        { id: 10, label: 'Item 1', subLabel: 'Sub 1', badge: 'New', icon: 'star' },
        { id: 20, label: 'Item 2' }
      ];
      const comp = fixture.componentInstance as SbdDropdownComponent<any>;
      comp.items = itemsWithDefaults;

      const adapted = comp.adaptedOptions();
      expect(adapted.length).toBe(2);
      expect(adapted[0]).toEqual({
        id: 10,
        label: 'Item 1',
        subLabel: 'Sub 1',
        badge: 'New',
        badgeColor: 'blue',
        icon: 'star',
        raw: itemsWithDefaults[0]
      });
      expect(adapted[1].label).toBe('Item 2');
      expect(adapted[1].subLabel).toBeUndefined();
    });

    it('should map items using custom key inputs', () => {
      component.items = mockItems;
      component.labelKey = 'name';
      component.valueKey = 'id';
      component.subLabelKey = 'category';
      component.badgeKey = 'tag';
      component.iconKey = 'iconName';

      const adapted = component.adaptedOptions();
      expect(adapted.length).toBe(3);
      expect(adapted[0].id).toBe('1');
      expect(adapted[0].label).toBe('Alpha Project');
      expect(adapted[0].subLabel).toBe('Engineering');
      expect(adapted[0].badge).toBe('Active');
      expect(adapted[0].icon).toBe('folder');
      expect(adapted[0].raw).toBe(mockItems[0]);
    });

    it('should use fallback id and label when keys are missing in item', () => {
      const partialItems: any[] = [{ otherProp: 'value' }];
      const comp = fixture.componentInstance as SbdDropdownComponent<any>;
      comp.items = partialItems;
      comp.valueKey = 'id';
      comp.labelKey = 'label';

      const adapted = comp.adaptedOptions();
      expect(adapted[0].id).toBe(0); // fallback to index
      expect(adapted[0].label).toBe('Option 1'); // fallback to Option 1
    });

    it('should use custom adapterFn if provided', () => {
      component.items = mockItems;
      const customAdapter: SbdDropdownAdapter<TestItem> = (item) => ({
        id: item.id,
        label: `Custom: ${item.name}`,
        badge: item.tag,
        raw: item
      });
      component.adapterFn = customAdapter;

      const adapted = component.adaptedOptions();
      expect(adapted[0].label).toBe('Custom: Alpha Project');
      expect(adapted[1].label).toBe('Custom: Beta Project');
    });
  });

  describe('ngOnChanges and selection sync', () => {
    beforeEach(() => {
      component.items = mockItems;
      component.labelKey = 'name';
      component.valueKey = 'id';
    });

    it('should synchronize selectedOption when selectedId is provided', () => {
      component.selectedId = '2';
      component.ngOnChanges({
        selectedId: new SimpleChange(null, '2', true)
      });

      expect(component.selectedOption()).toBeTruthy();
      expect(component.selectedOption()?.id).toBe('2');
      expect(component.selectedOption()?.label).toBe('Beta Project');
    });

    it('should synchronize selectedOption when items change', () => {
      component.selectedId = '1';
      component.ngOnChanges({
        items: new SimpleChange([], mockItems, false)
      });

      expect(component.selectedOption()?.label).toBe('Alpha Project');
    });

    it('should not change selectedOption if selectedId is not found', () => {
      component.selectedId = '999';
      component.ngOnChanges({
        selectedId: new SimpleChange(null, '999', true)
      });

      expect(component.selectedOption()).toBeNull();
    });
  });

  describe('toggleDropdown and dropdown state', () => {
    it('should toggle isOpen when toggleDropdown is called', () => {
      expect(component.isOpen()).toBe(false);
      component.toggleDropdown();
      expect(component.isOpen()).toBe(true);
      component.toggleDropdown();
      expect(component.isOpen()).toBe(false);
    });

    it('should reset searchQuery when dropdown is closed via toggleDropdown', () => {
      component.isOpen.set(true);
      component.searchQuery.set('search text');

      component.toggleDropdown(); // closes it
      expect(component.isOpen()).toBe(false);
      expect(component.searchQuery()).toBe('');
    });

    it('should not toggle dropdown if disabled is true', () => {
      component.disabled = true;
      component.toggleDropdown();
      expect(component.isOpen()).toBe(false);
    });

    it('should not toggle dropdown if loading is true', () => {
      component.loading = true;
      component.toggleDropdown();
      expect(component.isOpen()).toBe(false);
    });

    it('should close dropdown on escape key press', () => {
      component.isOpen.set(true);
      component.onEscape();
      expect(component.isOpen()).toBe(false);
    });

    it('should close dropdown when clicking outside', () => {
      component.isOpen.set(true);
      const outsideElement = document.createElement('div');
      document.body.appendChild(outsideElement);

      const event = new MouseEvent('click');
      Object.defineProperty(event, 'target', { value: outsideElement, enumerable: true });

      component.onDocumentClick(event);
      expect(component.isOpen()).toBe(false);
      document.body.removeChild(outsideElement);
    });

    it('should keep dropdown open when clicking inside element', () => {
      component.isOpen.set(true);
      const insideElement = fixture.nativeElement;
      const event = new MouseEvent('click');
      Object.defineProperty(event, 'target', { value: insideElement, enumerable: true });

      component.onDocumentClick(event);
      expect(component.isOpen()).toBe(true);
    });
  });

  describe('filtering and searching', () => {
    beforeEach(() => {
      component.items = mockItems;
      component.labelKey = 'name';
      component.subLabelKey = 'category';
      component.badgeKey = 'tag';
    });

    it('should return all options when searchQuery is empty', () => {
      component.searchQuery.set('');
      expect(component.filteredOptions().length).toBe(3);
    });

    it('should filter options by label (case-insensitive)', () => {
      component.searchQuery.set('alpha');
      const filtered = component.filteredOptions();
      expect(filtered.length).toBe(1);
      expect(filtered[0].label).toBe('Alpha Project');
    });

    it('should filter options by subLabel', () => {
      component.searchQuery.set('research');
      const filtered = component.filteredOptions();
      expect(filtered.length).toBe(1);
      expect(filtered[0].label).toBe('Beta Project');
    });

    it('should filter options by badge', () => {
      component.searchQuery.set('archived');
      const filtered = component.filteredOptions();
      expect(filtered.length).toBe(1);
      expect(filtered[0].label).toBe('Gamma System');
    });

    it('should update searchQuery signal when onSearchInput is called', () => {
      const inputEvent = { target: { value: 'test filter' } } as unknown as Event;
      component.onSearchInput(inputEvent);
      expect(component.searchQuery()).toBe('test filter');
    });
  });

  describe('option selection and outputs', () => {
    beforeEach(() => {
      component.items = mockItems;
      component.labelKey = 'name';
    });

    it('should select option, close dropdown, reset search query and emit events', () => {
      const option = component.adaptedOptions()[0];
      let emittedOption: SbdDropdownOption<TestItem> | undefined;
      let emittedRaw: TestItem | null | undefined;

      component.optionSelect.subscribe((opt) => (emittedOption = opt));
      component.selectionChange.subscribe((raw) => (emittedRaw = raw));

      component.isOpen.set(true);
      component.searchQuery.set('alpha');

      const mouseEvent = new MouseEvent('click');
      component.selectOption(option, mouseEvent);

      expect(component.selectedOption()).toBe(option);
      expect(component.isOpen()).toBe(false);
      expect(component.searchQuery()).toBe('');
      expect(emittedOption).toBe(option);
      expect(emittedRaw).toBe(mockItems[0]);
    });

    it('should not select option if option is disabled', () => {
      const disabledOption: SbdDropdownOption<TestItem> = {
        id: 'disabled',
        label: 'Disabled Option',
        disabled: true,
        raw: mockItems[0]
      };
      let emitted = false;
      component.optionSelect.subscribe(() => (emitted = true));

      component.isOpen.set(true);
      component.selectOption(disabledOption);

      expect(component.selectedOption()).toBeNull();
      expect(component.isOpen()).toBe(true);
      expect(emitted).toBe(false);
    });
  });

  describe('clear selection', () => {
    beforeEach(() => {
      component.items = mockItems;
      component.labelKey = 'name';
      component.selectedOption.set(component.adaptedOptions()[0]);
    });

    it('should reset selectedOption, emit null on selectionChange and emit cleared event', () => {
      let emittedRaw: any = 'not-null';
      let clearedEmitted = false;

      component.selectionChange.subscribe((val) => (emittedRaw = val));
      component.cleared.subscribe(() => (clearedEmitted = true));

      const mouseEvent = new MouseEvent('click');
      component.clearSelection(mouseEvent);

      expect(component.selectedOption()).toBeNull();
      expect(emittedRaw).toBeNull();
      expect(clearedEmitted).toBe(true);
    });
  });

  describe('custom actions', () => {
    beforeEach(() => {
      component.items = mockItems;
      component.labelKey = 'name';
      component.customActions = [
        { action: 'pin', label: 'Épingler', icon: 'pin' },
        { action: 'view-details', label: 'Détails', icon: 'eye' }
      ];
    });

    it('should emit itemAction with action name, option and event without selecting the item', () => {
      const option = component.adaptedOptions()[0];
      let emittedAction: any;

      component.itemAction.subscribe((act) => (emittedAction = act));

      const event = new MouseEvent('click');
      component.onActionClick('pin', option, event);

      expect(emittedAction).toEqual({
        action: 'pin',
        option,
        event
      });
      expect(component.selectedOption()).toBeNull();
    });
  });

  describe('DOM rendering and interaction', () => {
    it('should render placeholder when no item is selected', () => {
      component.placeholder = 'Sélectionnez un projet';
      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      expect(el.textContent).toContain('Sélectionnez un projet');
    });

    it('should render selected item label and subLabel', () => {
      component.items = mockItems;
      component.labelKey = 'name';
      component.subLabelKey = 'category';
      component.badgeKey = 'tag';
      component.selectedOption.set(component.adaptedOptions()[0]);
      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      expect(el.textContent).toContain('Alpha Project');
      expect(el.textContent).toContain('Engineering');
      expect(el.textContent).toContain('Active');
    });

    it('should render spinner when loading is true', () => {
      component.loading = true;
      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      expect(el.textContent).toContain('Chargement des données Sbd...');
      expect(el.querySelector('svg.animate-spin')).toBeTruthy();
    });

    it('should render clear button when clearable and selectedOption exist', () => {
      component.items = mockItems;
      component.labelKey = 'name';
      component.selectedOption.set(component.adaptedOptions()[0]);
      component.clearable = true;
      fixture.detectChanges();

      const clearBtn = fixture.nativeElement.querySelector('button[title="Effacer la sélection"]');
      expect(clearBtn).toBeTruthy();
    });

    it('should open dropdown menu when trigger button is clicked', () => {
      component.items = mockItems;
      component.labelKey = 'name';
      fixture.detectChanges();

      const triggerBtn = fixture.nativeElement.querySelector('button[type="button"]');
      triggerBtn.click();
      fixture.detectChanges();

      expect(component.isOpen()).toBe(true);
      const searchInput = fixture.nativeElement.querySelector('input[type="text"]');
      expect(searchInput).toBeTruthy();
    });

    it('should render "Aucun projet ou élément trouvé" when filter returns empty', () => {
      component.items = mockItems;
      component.labelKey = 'name';
      component.isOpen.set(true);
      component.searchQuery.set('non-existent-search-term');
      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      expect(el.textContent).toContain('Aucun projet ou élément trouvé');
    });
  });
});
