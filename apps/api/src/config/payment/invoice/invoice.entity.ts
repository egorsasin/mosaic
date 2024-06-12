import { Column, Entity } from 'typeorm';

import { MosaicEntity } from '@mosaic/core';

@Entity()
export class Invoice extends MosaicEntity {
  constructor(input: Partial<Invoice>) {
    super(input);
  }

  @Column({ nullable: false })
  orderId: string;

  @Column({ nullable: false, type: 'int', unique: true })
  invoiceNumber: number;

  @Column({ nullable: false })
  storageReference: string;
}
