import { ChangeDetectionStrategy, Component, ElementRef } from '@angular/core';

@Component({
  selector: 'mos-scroll',
  templateUrl: './scroll.component.html',
  styleUrls: ['./scroll.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [],
})
export class MosScrollComponent {
  readonly browserScrollRef = new ElementRef(this.elementRef.nativeElement);

  constructor(private elementRef: ElementRef) {}
}
