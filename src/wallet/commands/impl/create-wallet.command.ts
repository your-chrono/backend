export class CreateWalletCommand {
  constructor(
    public readonly data: {
      readonly userId: string;
    },
  ) {}
}

export type CreateWalletCommandData = CreateWalletCommand['data'];

export type CreateWalletCommandReturnType = {
  walletId: string;
};
