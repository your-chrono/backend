export class CompleteBookingCommand {
  constructor(
    public readonly data: {
      readonly bookingId: string;
      readonly performedBy: string;
      readonly expectedVersion?: Date;
    },
  ) {}
}

export type CompleteBookingCommandData = CompleteBookingCommand['data'];

export type CompleteBookingCommandReturnType = {
  bookingId: string;
};
