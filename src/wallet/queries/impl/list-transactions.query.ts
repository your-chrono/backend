import { Transaction, TransactionType } from '@prisma/client';
import { IPaginatedType } from '../../../shared';

export class ListTransactionsQuery {
  constructor(
    public readonly data: {
      readonly userId: string;
      readonly type?: TransactionType;
      readonly first: number;
      readonly after?: string;
    },
  ) {}
}

export type ListTransactionsQueryData = ListTransactionsQuery['data'];

export type ListTransactionsQueryReturnType = IPaginatedType<Transaction>;
