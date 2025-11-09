export class ConfirmBookingCommand {
  constructor(
    public readonly data: {
      readonly bookingId: string;
      readonly requesterId: string;
      readonly expectedVersion?: Date;
    },
  ) {}
}

export type ConfirmBookingCommandData = ConfirmBookingCommand['data'];

export type ConfirmBookingCommandReturnType = {
  bookingId: string;
};
