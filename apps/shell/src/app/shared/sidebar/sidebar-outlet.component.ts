import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  Type,
  ViewContainerRef,
} from '@angular/core';

@Component({
  selector: 'ts-sidebar-outlet',
  template: '<!-- SIDEBAR COMPONENT OUTLET-->',
})
export class SidebarOutletComponent<T> implements OnInit {
  @Input() component!: Type<T>;
  @Output() create = new EventEmitter<T>();

  constructor(private viewContainerRef: ViewContainerRef) {}

  ngOnInit() {
    const componentRef = this.viewContainerRef.createComponent(this.component);
    this.create.emit(componentRef.instance);
  }
}
