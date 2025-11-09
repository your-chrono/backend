export class TopUpWalletCommand {
  constructor(
    public readonly data: {
      readonly userId: string;
      readonly amount: number;
      readonly description?: string;
    },
  ) {}
}

export type TopUpWalletCommandData = TopUpWalletCommand['data'];

export type TopUpWalletCommandReturnType = {
  walletId: string;
};
