export abstract class MosaicEvent {
  public readonly createdAt: Date;

  protected constructor() {
    this.createdAt = new Date();
  }
}


