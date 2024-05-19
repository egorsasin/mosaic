import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';

import { NotificationType } from '../../services';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'mos-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss'],
})
export class NotificationComponent {
  @ViewChild('wrapper', { static: true }) wrapper?: ElementRef;

  public offsetTop = 0;
  public message = '';
  public type: NotificationType = 'info';
  public isVisible = true;

  private onClickFn: () => void = () => {};

  public registerOnClickFn(fn: () => void): void {
    this.onClickFn = fn;
  }

  @HostListener('click')
  public onClick(): void {
    if (this.isVisible) {
      this.onClickFn();
    }
  }

  fadeOut(): Promise<any> {
    this.isVisible = false;
    return new Promise((resolve) => setTimeout(resolve, 1000));
  }

  getHeight(): number {
    if (!this.wrapper) {
      return 0;
    }
    const el: HTMLElement = this.wrapper.nativeElement;
    return el.getBoundingClientRect().height;
  }
}
