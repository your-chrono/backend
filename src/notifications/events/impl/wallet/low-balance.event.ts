export class LowBalanceEvent {
  constructor(
    public readonly userId: string,
    public readonly walletId: string,
    public readonly currentBalance: number,
    public readonly threshold: number,
  ) {}
}
