export class BookingCreatedEvent {
  constructor(
    public readonly bookingId: string,
    public readonly userId: string,
    public readonly expertId: string,
    public readonly slotId: string,
    public readonly creditsLocked: number,
    public readonly startTime: Date,
    public readonly endTime: Date,
  ) {}
}
