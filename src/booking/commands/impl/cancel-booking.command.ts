export class CancelBookingCommand {
  constructor(
    public readonly data: {
      readonly bookingId: string;
      readonly requesterId: string;
      readonly expectedVersion?: Date;
      readonly reason?: string;
    },
  ) {}
}

export type CancelBookingCommandData = CancelBookingCommand['data'];

export type CancelBookingCommandReturnType = {
  bookingId: string;
};
