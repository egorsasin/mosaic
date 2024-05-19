import {
  Column,
  DataSource,
  Entity,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  JoinColumn,
  OneToMany,
  OneToOne,
  UpdateEvent,
} from 'typeorm';

import { MosaicEntity, SoftDeletable } from '../entity';
import { Address } from '../address';
import { User } from '../user';

@Entity()
export class Customer extends MosaicEntity implements SoftDeletable {
  constructor(input?: Partial<Customer>) {
    super(input);
  }

  @Column({ name: 'deleted_at', type: Date, nullable: true })
  public deletedAt: Date | null;

  @Column({ name: 'first_name' })
  firstName: string;

  @Column({ name: 'last_name' })
  lastName: string;

  @Column({ name: 'user_id', unsigned: true, select: false })
  userId: number;

  @OneToMany(() => Address, (address) => address.customer)
  addresses: Address[];

  @OneToOne(() => User, { eager: true })
  @JoinColumn({ name: 'user_id' })
  user?: User;
}

class Changes extends MosaicEntity {}

@EventSubscriber()
export class UserSubscriber<T> implements EntitySubscriberInterface<T> {
  constructor(private dataSource: DataSource) {
    this.dataSource.subscribers.push(this);
  }

  beforeUpdate(event: UpdateEvent<T>) {
    const { entity, databaseEntity } = event;
    const changes = {};

    Object.keys(entity).forEach((param) => {
      if (entity[param] !== databaseEntity[param]) {
        changes[param] = { new: entity[param], old: databaseEntity[param] };
      }
    });

    const auditItem = { entity: entity.name, id: entity.id, metadata: changes };

    this.dataSource.getRepository(Changes).save(auditItem);
  }
}
