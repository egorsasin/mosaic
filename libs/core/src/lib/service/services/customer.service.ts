import { Inject, Injectable } from '@nestjs/common';
import { DataSource, EntityNotFoundError, IsNull } from 'typeorm';

import {
  CreateCustomerInput,
  EmailAddressConflictError,
  assertFound,
  normalizeEmailAddress,
} from '@mosaic/common';

import { CustomerEvent, EventBus } from '../../event-bus';
import { Address, Customer, DATA_SOURCE_PROVIDER } from '../../data';
import { CreateAddressInput } from '../../types';
import { RequestContext } from '../../api/common';

@Injectable()
export class CustomerService {
  constructor(
    @Inject(DATA_SOURCE_PROVIDER) private readonly dataSource: DataSource,
    private readonly eventBus: EventBus
  ) {}

  public async findOne(
    ctx: RequestContext,
    id: number
  ): Promise<Customer | undefined> {
    return this.dataSource
      .getRepository(Customer)
      .findOne({
        where: { id, deletedAt: IsNull() },
      })
      .then((result) => result ?? undefined);
  }

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

  public async createOrUpdate(
    ctx: RequestContext,
    input: CreateCustomerInput,
    errorOnExistingUser = false
  ): Promise<Customer | EmailAddressConflictError> {
    input.emailAddress = normalizeEmailAddress(input.emailAddress);
    let customer: Customer;
    const existing = await this.dataSource.getRepository(Customer).findOne({
      where: {
        emailAddress: input.emailAddress,
        deletedAt: IsNull(),
      },
    });
    if (existing) {
      if (existing.user && errorOnExistingUser) {
        // It is not permitted to modify an existing *registered* Customer
        return new EmailAddressConflictError();
      }
      customer = { ...existing, ...input };
    } else {
      customer = await this.dataSource
        .getRepository(Customer)
        .save(new Customer(input));
      this.eventBus.publish(new CustomerEvent(ctx, customer, 'created', input));
    }

    return await this.dataSource.getRepository(Customer).save(customer);
  }

  public async update(
    ctx: RequestContext,
    { id, ...input }: CreateCustomerInput & { id: number }
  ): Promise<Customer> {
    const customer = await this.findOne(ctx, id);

    if (!customer) {
      throw new EntityNotFoundError(Customer.name, id);
    }

    const updatedCustomer = { ...customer, ...input };
    await this.dataSource
      .getRepository(Customer)
      .save(updatedCustomer, { reload: false });

    this.eventBus.publish(new CustomerEvent(ctx, customer, 'updated', input));
    return assertFound(this.findOne(ctx, customer.id));
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
