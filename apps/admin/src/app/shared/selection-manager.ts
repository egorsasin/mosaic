import { Observable, Subject } from 'rxjs';

export interface SelectionManagerOptions<T> {
  multiSelect: boolean;
  itemsAreEqual: (a: T, b: T) => boolean;
  additiveMode: boolean;
}

export class SelectionManager<T> {
  constructor(private options: SelectionManagerOptions<T>) {
    this.selectionChanges$ = this.selectionChangesSubject.asObservable();
  }

  public get selection(): T[] {
    return this.selectionInternal;
  }

  selectionChanges$: Observable<T[]>;

  private selectionInternal: T[] = [];
  private items: T[] = [];
  private selectionChangesSubject = new Subject<T[]>();

  public setMultiSelect(isMultiSelect: boolean): void {
    this.options.multiSelect = isMultiSelect;
  }

  public setCurrentItems(items: T[]) {
    this.items = items;
  }

  public toggleSelection(item: T, event?: MouseEvent): void {
    const { multiSelect, itemsAreEqual, additiveMode } = this.options;
    const index = this.selectionInternal.findIndex((a) =>
      itemsAreEqual(a, item)
    );

    if (multiSelect && event?.shiftKey && 1 <= this.selectionInternal.length) {
      const lastSelection =
        this.selectionInternal[this.selectionInternal.length - 1];
      const lastSelectionIndex = this.items.findIndex((a) =>
        itemsAreEqual(a, lastSelection)
      );
      const currentIndex = this.items.findIndex((a) => itemsAreEqual(a, item));
      const start =
        currentIndex < lastSelectionIndex ? currentIndex : lastSelectionIndex;
      const end =
        currentIndex > lastSelectionIndex
          ? currentIndex + 1
          : lastSelectionIndex;
      this.selectionInternal.push(
        ...this.items
          .slice(start, end)
          .filter(
            (a) => !this.selectionInternal.find((s) => itemsAreEqual(a, s))
          )
      );
    } else if (index === -1) {
      if (multiSelect && (event?.ctrlKey || event?.shiftKey || additiveMode)) {
        this.selectionInternal.push(item);
      } else {
        this.selectionInternal = [item];
      }
    } else {
      if (multiSelect && event?.ctrlKey) {
        this.selectionInternal.splice(index, 1);
      } else if (1 < this.selectionInternal.length && !additiveMode) {
        this.selectionInternal = [item];
      } else {
        this.selectionInternal.splice(index, 1);
      }
    }
    // Make the selection mutable
    this.selectionInternal = this.selectionInternal.map((x) => ({ ...x }));
    this.invokeOnSelectionChangeHandler();
  }

  public selectMultiple(items: T[]): void {
    this.selectionInternal = items;
    this.invokeOnSelectionChangeHandler();
  }

  public clearSelection(): void {
    this.selectionInternal = [];
    this.invokeOnSelectionChangeHandler();
  }

  public isSelected(item: T): boolean {
    return !!this.selectionInternal.find((a) =>
      this.options.itemsAreEqual(a, item)
    );
  }

  public areAllCurrentItemsSelected(): boolean {
    if (!this.items || this.items.length === 0) {
      return false;
    }
    return this.items.every((a) =>
      this.selectionInternal.find((b) => this.options.itemsAreEqual(a, b))
    );
  }

  public toggleSelectAll(): void {
    if (this.areAllCurrentItemsSelected()) {
      this.selectionInternal = this.selectionInternal.filter(
        (a) => !this.items.find((b) => this.options.itemsAreEqual(a, b))
      );
    } else {
      this.selectionInternal = this.selectionInternal.slice(0);
      for (const item of this.items) {
        if (
          !this.selectionInternal.find((a) =>
            this.options.itemsAreEqual(a, item)
          )
        ) {
          this.selectionInternal.push(item);
        }
      }
    }
    this.invokeOnSelectionChangeHandler();
  }

  public lastSelected(): T {
    return this.selectionInternal[this.selectionInternal.length - 1];
  }

  private invokeOnSelectionChangeHandler(): void {
    this.selectionChangesSubject.next(this.selectionInternal);
  }
}
