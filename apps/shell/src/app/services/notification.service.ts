import { ComponentRef, Injectable, ViewContainerRef } from '@angular/core';

import { NotificationComponent } from '../components/notification/notification.component';

import { OverlayHostService } from './overlay-host.service';

export type NotificationType = 'info' | 'success' | 'error' | 'warning';

export interface ToastConfig {
  message: string;
  translationVars?: { [key: string]: string | number };
  type?: NotificationType;
  duration?: number;
}

const TOAST_DURATION = 3000;

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private get hostView(): Promise<ViewContainerRef> {
    return this.overlayHostService.getHostView();
  }

  private openToastRefs: Array<{
    ref: ComponentRef<NotificationComponent>;
    timerId: any;
  }> = [];

  constructor(private overlayHostService: OverlayHostService) {}

  public success(message: string): void {
    this.notify({
      message,
      type: 'success',
    });
  }

  public info(message: string): void {
    this.notify({
      message,
      type: 'info',
    });
  }

  public warning(message: string): void {
    this.notify({
      message,
      type: 'warning',
    });
  }

  public error(message: string): void {
    this.notify({
      message,
      type: 'error',
      duration: 20000,
    });
  }

  public notify(config: ToastConfig): void {
    this.createToast(config);
  }

  private async createToast(config: ToastConfig): Promise<void> {
    const hostView = await this.hostView;
    const ref = hostView.createComponent<NotificationComponent>(
      NotificationComponent
    );
    const toast: NotificationComponent = ref.instance;
    const dismissFn = this.createDismissFunction(ref);

    toast.type = config.type || 'info';
    toast.message = config.message;
    toast.registerOnClickFn(dismissFn);

    let timerId;
    if (!config.duration || 0 < config.duration) {
      timerId = setTimeout(dismissFn, config.duration || TOAST_DURATION);
    }

    this.openToastRefs.unshift({ ref, timerId });
    setTimeout(() => this.calculatePositions());
  }

  private createDismissFunction(
    ref: ComponentRef<NotificationComponent>
  ): () => void {
    return () => {
      const toast: NotificationComponent = ref.instance;
      const index = this.openToastRefs.map((toast) => toast.ref).indexOf(ref);

      if (this.openToastRefs[index]) {
        clearTimeout(this.openToastRefs[index].timerId);
      }

      toast.fadeOut().then(() => {
        ref.destroy();
        this.openToastRefs.splice(index, 1);
        this.calculatePositions();
      });
    };
  }

  private calculatePositions(): void {
    let cumulativeHeight = 10;

    this.openToastRefs.forEach((obj) => {
      const toast: NotificationComponent = obj.ref.instance;
      toast.offsetTop = cumulativeHeight;
      cumulativeHeight += toast.getHeight() + 6;
    });
  }
}
