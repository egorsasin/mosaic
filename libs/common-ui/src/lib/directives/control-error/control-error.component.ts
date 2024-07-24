import {
  Component,
  Input,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';

@Component({
  template: ` <small class="text-danger">{{ errorText }}</small> `,
  styleUrls: ['./control-error.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ControlErrorComponent {
  public errorText?: string;
  public show = false;

  constructor(private changeDetector: ChangeDetectorRef) {}

  @Input() set error(value: string | null) {
    if (value !== this.errorText) {
      this.errorText = value || '';
      this.show = !!value;
      this.changeDetector.detectChanges();
    }
  }
}
