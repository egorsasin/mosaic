import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  Inject,
  ViewEncapsulation,
} from '@angular/core';

import { MOSAIC_CONTEXT, WINDOW } from '@mosaic/cdk';

const config = {
  defaultLocale: 'pl',
  closeTooltip: true,
  points: {
    types: ['parcel_locker'],
    function: ['parcel_collect'],
  },
  mapType: 'osm',
  searchType: 'osm',
  map: {
    googleKey: 'AIzaSyDZc6Ajf0PqhUAzbktozQyHFpi5V7TZW_o',
  },
  closestLimit: 500,
  paymentFilter: {
    visible: false,
    defaultEnabled: false,
  },
};

@Component({
  selector: 'mos-inpost-map',
  templateUrl: './inpost-map.component.html',
  styleUrls: ['./inpost-map.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class MosInpostMapComponent implements AfterViewInit {
  constructor(
    @Inject(WINDOW) private window: Window & { easyPack: any },
    @Inject(MOSAIC_CONTEXT) public context: any
  ) {}

  public ngAfterViewInit(): void {
    const easyPack = this.window.easyPack;

    easyPack.init(config);

    const implicit = this.context;

    easyPack.mapWidget('mos-easypack-map', function (data: any) {
      implicit.completeWith(data);
    });
  }
}
