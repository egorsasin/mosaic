import {
  ComponentRef,
  Directive,
  ElementRef,
  InjectionToken,
  INJECTOR,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  TemplateRef,
} from '@angular/core';

import { ContextWrapper } from '@mosaic/cdk/common';

import { DropdownHostComponent } from './dropdown-host.component';
import { OverlayHostService } from '../overlay-host';
import { ClientRectAccessor } from '../types';

const SHOW_DROPDOWN = 'show';

const DROPDOWN_HOST = new InjectionToken('Dropdown host', {
  factory: () => DropdownHostComponent,
});

export function isNativeFocusedIn(node: Node): boolean {
  if (!node.ownerDocument || !node.contains) {
    return false;
  }
  const nativeFocused = getNativeFocused(node.ownerDocument);
  return nativeFocused !== null && node.contains(nativeFocused);
}

export function getNativeFocused(documentRef: Document): Element | null {
  if (!documentRef.activeElement?.shadowRoot) {
    return documentRef.activeElement;
  }
  let element = documentRef.activeElement.shadowRoot.activeElement;
  while (element?.shadowRoot) {
    element = element.shadowRoot.activeElement;
  }
  return element;
}

@Directive({
  selector: `[mosDropdown]`,
  exportAs: `mosDropdownDirective`,
  providers: [
    {
      provide: ContextWrapper,
      deps: [DROPDOWN_HOST, INJECTOR],
      useClass: ContextWrapper,
    },
    { provide: ClientRectAccessor, useExisting: MosDropdownDirective },
  ],
})
export class MosDropdownDirective
  implements OnChanges, OnDestroy, ClientRectAccessor
{
  private dropdownHostRef: ComponentRef<DropdownHostComponent> | null = null;

  @Input(`mosDropdown`)
  public content?: TemplateRef<unknown>;

  public get focused(): boolean {
    const { dropdownHostRef } = this;
    if (!dropdownHostRef) {
      return false;
    }
    return isNativeFocusedIn(dropdownHostRef.instance.nativeElement);
  }

  @Input(SHOW_DROPDOWN)
  public show = false;

  public get clientRect(): DOMRect {
    return this.elementRef.nativeElement.getBoundingClientRect();
  }

  constructor(
    private overlayHostService: OverlayHostService,
    private contextWrapper: ContextWrapper<DropdownHostComponent>,
    private elementRef: ElementRef
  ) {}

  public ngOnChanges(changes: SimpleChanges) {
    if (Object.keys(changes).includes(SHOW_DROPDOWN)) {
      setTimeout(() => this.toggle(changes[SHOW_DROPDOWN].currentValue));
    }
  }

  public ngOnDestroy(): void {
    this.toggle(false);
  }

  public getClientRect(): DOMRect {
    return this.elementRef.nativeElement.getBoundingClientRect();
  }

  private toggle(show: boolean) {
    if (show && this.content && !this.dropdownHostRef) {
      const dropdownHostRef = this.overlayHostService.add(this.contextWrapper);
      const dropdownHostInstance = dropdownHostRef.instance;

      dropdownHostInstance.templateRef = this.content;
      this.dropdownHostRef = dropdownHostRef;
    } else if (!show && this.dropdownHostRef) {
      this.overlayHostService.remove(this.dropdownHostRef);
      this.dropdownHostRef = null;
    }
  }
}
