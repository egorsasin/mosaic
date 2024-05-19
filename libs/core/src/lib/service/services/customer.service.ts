import { Inject, Injectable } from '@nestjs/common';
import { DataSource, IsNull } from 'typeorm';

import { Address, Customer } from '../../data';
import { DATA_SOURCE_PROVIDER } from '../../data/data.module';
import { CreateAddressInput } from '../../types';

@Injectable()
export class CustomerService {
  constructor(
    @Inject(DATA_SOURCE_PROVIDER) private readonly dataSource: DataSource
  ) {}

  public findOneByUserId(userId: number): Promise<Customer | undefined> {
    return this.dataSource.getRepository(Customer).findOne({
      where: {
        user: { id: userId },
        deletedAt: IsNull(),
      },
    });
  }

  public findAddressesByCustomerId(customerId: number): Promise<Address[]> {
    return this.dataSource.getRepository(Address).find({
      where: { customer: { id: customerId } },
    });
  }

  public async createAddress(
    customerId: number,
    input: CreateAddressInput
  ): Promise<Address> {
    const customer = await this.dataSource.getRepository(Customer).findOne({
      where: {
        id: customerId,
        deletedAt: IsNull(),
      },
      relations: ['addresses'],
    });
    const address = new Address({
      ...input,
    });
    const createdAddress = await this.dataSource
      .getRepository(Address)
      .save(address);
    customer.addresses.push(createdAddress);

    await this.dataSource.getRepository(Customer).save(customer, {
      reload: false,
    });

    await this.enforceSingleDefaultAddress(createdAddress.id, input);

    return createdAddress;
  }

  private async enforceSingleDefaultAddress(
    addressId: number,
    input: CreateAddressInput
  ) {
    const result = await this.dataSource.getRepository(Address).findOne({
      where: { id: addressId },
      relations: ['customer', 'customer.addresses'],
    });
    if (result) {
      const customerAddressIds = result.customer.addresses
        .map((a) => a.id)
        .filter((id) => id !== addressId);

      if (customerAddressIds.length && input.default === true) {
        await this.dataSource
          .getRepository(Address)
          .update(customerAddressIds, {
            default: false,
          });
      }
    }
  }
}
