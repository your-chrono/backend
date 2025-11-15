export class BookingRejectedEvent {
  constructor(
    public readonly bookingId: string,
    public readonly userId: string,
    public readonly expertId: string,
    public readonly slotId: string,
    public readonly creditsRefunded: number,
    public readonly reason?: string,
  ) {}
}
