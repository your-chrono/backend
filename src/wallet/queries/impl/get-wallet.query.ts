import { Wallet } from '@prisma/client';

export class GetWalletQuery {
  constructor(
    public readonly data: {
      readonly userId: string;
    },
  ) {}
}

export type GetWalletQueryData = GetWalletQuery['data'];

export type GetWalletQueryReturnType = Wallet;
