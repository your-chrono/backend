export class LockCreditsCommand {
  constructor(
    public readonly data: {
      readonly userId: string;
      readonly bookingId: string;
      readonly amount: number;
      readonly description?: string;
    },
  ) {}
}

export type LockCreditsCommandData = LockCreditsCommand['data'];

export type LockCreditsCommandReturnType = {
  walletId: string;
};
