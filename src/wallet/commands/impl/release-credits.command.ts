export class ReleaseCreditsCommand {
  constructor(
    public readonly data: {
      readonly expertId: string;
      readonly bookingId: string;
      readonly amount: number;
      readonly description?: string;
    },
  ) {}
}

export type ReleaseCreditsCommandData = ReleaseCreditsCommand['data'];

export type ReleaseCreditsCommandReturnType = {
  walletId: string;
};
