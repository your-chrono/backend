export class RefundCreditsCommand {
  constructor(
    public readonly data: {
      readonly userId: string;
      readonly bookingId: string;
      readonly amount: number;
      readonly description?: string;
    },
  ) {}
}

export type RefundCreditsCommandData = RefundCreditsCommand['data'];

export type RefundCreditsCommandReturnType = {
  walletId: string;
};
