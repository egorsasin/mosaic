import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { gql } from 'apollo-angular';

import { MutationArgs } from '@mosaic/common';

import { catchError, map, Observable, of, take } from 'rxjs';
import { DataService } from '../../data';

export const paymentStateResolver: ResolveFn<unknown> = (
  route: ActivatedRouteSnapshot
): Observable<string | null> => {
  const paymentMethod = route.paramMap.get('paymentMethod');
  const transactionId = route.queryParamMap.get('paymentId');

  if (paymentMethod !== 'paynow' || !transactionId) {
    return of(null);
  }

  return inject(DataService)
    .mutate<PaymentStateUpdateResult, MutationArgs<PaymentStateInput>>(
      UPDATE_PAYMENT_STATE,
      {
        input: { transactionId },
      }
    )
    .pipe(
      catchError(() => of(null)),
      take(1),
      map((result) => result?.updatePynowPaymentStatus?.orderCode || null)
    );
};

export interface PaymentStateInput {
  transactionId: string;
}

export interface PaymentStateUpdateResult {
  updatePynowPaymentStatus: {
    orderCode: string;
  };
}

const UPDATE_PAYMENT_STATE = gql`
  mutation UpdatePynowPaymentStatus($input: PaynowPaymentUpdateInput!) {
    updatePynowPaymentStatus(input: $input) {
      ... on PaynowPaymentResponse {
        orderCode
      }
      ... on NoActiveOrderError {
        message
        errorCode
      }
    }
  }
`;
