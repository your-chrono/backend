export class BookingReminderEvent {
  constructor(
    public readonly bookingId: string,
    public readonly userId: string,
    public readonly expertId: string,
    public readonly slotId: string,
    public readonly startTime: Date,
    public readonly minutesUntilStart: number,
  ) {}
}
