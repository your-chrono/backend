export class WithdrawWalletCommand {
  constructor(
    public readonly data: {
      readonly userId: string;
      readonly amount: number;
      readonly description?: string;
    },
  ) {}
}

export type WithdrawWalletCommandData = WithdrawWalletCommand['data'];

export type WithdrawWalletCommandReturnType = {
  walletId: string;
};
