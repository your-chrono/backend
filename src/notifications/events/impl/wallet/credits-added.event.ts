export class CreditsAddedEvent {
  constructor(
    public readonly userId: string,
    public readonly walletId: string,
    public readonly amount: number,
    public readonly newBalance: number,
    public readonly transactionId: string,
    public readonly description?: string,
  ) {}
}
