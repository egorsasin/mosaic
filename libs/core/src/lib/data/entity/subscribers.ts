import { EntitySubscriberInterface, EventSubscriber, InsertEvent } from 'typeorm';

@EventSubscriber()
export class CalculatedPropertySubscriber<T> implements EntitySubscriberInterface<T> {
  public afterLoad(entity: T) {
    this.moveCalculatedGettersToInstance(entity);
  }

  public afterInsert(event: InsertEvent<T>): Promise<T> | void {
    this.moveCalculatedGettersToInstance(event.entity);
  }

  private moveCalculatedGettersToInstance(entity: T) {
    if (entity) {
    }
    //const prototype: EntityPrototype = Object.getPrototypeOf(entity);
  }
}

export const coreSubscribersMap = {
  CalculatedPropertySubscriber,
};
