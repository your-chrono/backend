export class CreditsLockedEvent {
  constructor(
    public readonly userId: string,
    public readonly walletId: string,
    public readonly amount: number,
    public readonly bookingId: string,
    public readonly transactionId: string,
    public readonly newBalance: number,
  ) {}
}
