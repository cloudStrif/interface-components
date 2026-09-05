import {
  Component,
  Input,
  Output,
  EventEmitter,
  Signal,
  WritableSignal,
  signal,
  computed,
  ElementRef,
  HostListener,
  inject,
  OnChanges,
  SimpleChanges,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  SafranDropdownOption,
  SafranDropdownAdapter,
  SafranDropdownActionEvent
} from '../../models/dropdown.model';

@Component({
  selector: 'app-safran-dropdown',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './safran-dropdown.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SafranDropdownComponent<T = any> implements OnChanges {
  private elementRef = inject(ElementRef);

  // Inputs
  @Input() items: T[] = [];
  @Input() adapterFn?: SafranDropdownAdapter<T>;
  @Input() labelKey: string = 'label';
  @Input() valueKey: string = 'id';
  @Input() subLabelKey?: string = 'subLabel';
  @Input() badgeKey?: string = 'badge';
  @Input() iconKey?: string = 'icon';

  @Input() placeholder: string = 'Sélectionner une option...';
  @Input() searchPlaceholder: string = 'Rechercher un projet...';
  @Input() searchable: boolean = true;
  @Input() clearable: boolean = true;
  @Input() loading: boolean = false;
  @Input() disabled: boolean = false;
  @Input() selectedId: string | number | null = null;
  
  // Custom actions per row
  @Input() customActions: Array<{ action: string; label: string; icon: string }> = [];

  // Outputs
  @Output() selectionChange = new EventEmitter<T | null>();
  @Output() optionSelect = new EventEmitter<SafranDropdownOption<T>>();
  @Output() itemAction = new EventEmitter<SafranDropdownActionEvent<T>>();
  @Output() cleared = new EventEmitter<void>();

  // State Signals
  public isOpen: WritableSignal<boolean> = signal(false);
  public searchQuery: WritableSignal<string> = signal('');
  public selectedOption: WritableSignal<SafranDropdownOption<T> | null> = signal(null);

  // Adapted options computed signal
  public adaptedOptions: Signal<SafranDropdownOption<T>[]> = computed(() => {
    const rawItems = this.items || [];
    if (!rawItems.length) return [];

    return rawItems.map((item, index) => {
      if (this.adapterFn) {
        return this.adapterFn(item);
      }
      // Fallback adapter using key mappings
      const rec = item as Record<string, any>;
      const id = rec[this.valueKey] !== undefined ? rec[this.valueKey] : index;
      const label = rec[this.labelKey] ? String(rec[this.labelKey]) : `Option ${index + 1}`;
      const subLabel = this.subLabelKey && rec[this.subLabelKey] ? String(rec[this.subLabelKey]) : undefined;
      const badge = this.badgeKey && rec[this.badgeKey] ? String(rec[this.badgeKey]) : undefined;
      const icon = this.iconKey && rec[this.iconKey] ? String(rec[this.iconKey]) : undefined;

      return {
        id,
        label,
        subLabel,
        badge,
        badgeColor: 'blue',
        icon,
        raw: item
      };
    });
  });

  // Filtered options based on search query
  public filteredOptions: Signal<SafranDropdownOption<T>[]> = computed(() => {
    const options = this.adaptedOptions();
    const query = this.searchQuery().toLowerCase().trim();

    if (!query) return options;

    return options.filter(opt => {
      const matchLabel = opt.label.toLowerCase().includes(query);
      const matchSubLabel = opt.subLabel ? opt.subLabel.toLowerCase().includes(query) : false;
      const matchBadge = opt.badge ? opt.badge.toLowerCase().includes(query) : false;
      return matchLabel || matchSubLabel || matchBadge;
    });
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedId'] || changes['items']) {
      this.syncSelectedOption();
    }
  }

  private syncSelectedOption(): void {
    if (this.selectedId !== null && this.selectedId !== undefined) {
      const found = this.adaptedOptions().find(opt => String(opt.id) === String(this.selectedId));
      if (found) {
        this.selectedOption.set(found);
      }
    }
  }

  public toggleDropdown(): void {
    if (this.disabled || this.loading) return;
    this.isOpen.update(val => !val);
    if (!this.isOpen()) {
      this.searchQuery.set('');
    }
  }

  public selectOption(option: SafranDropdownOption<T>, event?: MouseEvent): void {
    if (event) {
      event.stopPropagation();
    }
    if (option.disabled) return;

    this.selectedOption.set(option);
    this.isOpen.set(false);
    this.searchQuery.set('');

    this.optionSelect.emit(option);
    this.selectionChange.emit(option.raw);
  }

  public clearSelection(event: MouseEvent): void {
    event.stopPropagation();
    this.selectedOption.set(null);
    this.selectionChange.emit(null);
    this.cleared.emit();
  }

  public onActionClick(action: string, option: SafranDropdownOption<T>, event: MouseEvent): void {
    event.stopPropagation();
    this.itemAction.emit({
      action,
      option,
      event
    });
  }

  public onSearchInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.searchQuery.set(val);
  }

  @HostListener('document:click', ['$event'])
  public onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
    }
  }

  @HostListener('keydown.escape')
  public onEscape(): void {
    this.isOpen.set(false);
  }
}
