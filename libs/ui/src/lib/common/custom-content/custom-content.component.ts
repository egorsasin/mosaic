import { Component } from '@angular/core';

@Component({
  selector: 'mos-custom-content',
  template: '<ng-content></ng-content>',
  styles: [':host { display: inline-block; flex: 1 }'],
  standalone: true,
})
export class MosCustomContentComponent {}
