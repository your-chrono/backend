export class BookingCancelledEvent {
  constructor(
    public readonly bookingId: string,
    public readonly userId: string,
    public readonly expertId: string,
    public readonly slotId: string,
    public readonly cancelledBy: string,
    public readonly creditsRefunded: number,
    public readonly reason?: string,
  ) {}
}
