export class BookingCompletedEvent {
  constructor(
    public readonly bookingId: string,
    public readonly userId: string,
    public readonly expertId: string,
    public readonly slotId: string,
    public readonly creditsReleased: number,
    public readonly completedAt: Date,
  ) {}
}
