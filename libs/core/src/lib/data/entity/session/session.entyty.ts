import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  TableInheritance,
} from 'typeorm';
import { MosaicEntity } from '../entity';
import { Order } from '../order';

export enum SessionTypes {
  AUTHENTICATED = 'Authenticated',
  ANONYMOUS = 'Anonymous',
}

@Entity()
@TableInheritance({
  column: { name: 'type' },
})
export abstract class Session extends MosaicEntity {
  constructor(input?: Partial<Session>) {
    super(input);
  }

  @Column({ unique: true, nullable: false }) token: string;

  @Column() expires: Date;

  @Column() invalidated: boolean;

  @Column({ name: 'active_order_id', unsigned: true, nullable: true })
  activeOrderId: number;

  @ManyToOne(() => Order, {})
  @JoinColumn({ name: 'active_order_id' })
  activeOrder: Order | null;

  @Column({
    type: 'enum',
    enum: SessionTypes,
  })
  readonly type: SessionTypes;
}
