export class CreateBookingCommand {
  constructor(
    public readonly data: {
      readonly slotId: string;
      readonly userId: string;
    },
  ) {}
}

export type CreateBookingCommandData = CreateBookingCommand['data'];

export type CreateBookingCommandReturnType = {
  bookingId: string;
};
