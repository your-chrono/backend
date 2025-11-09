import { BookingStatus } from '@prisma/client';

export class UpdateBookingStatusCommand {
  constructor(
    public readonly data: {
      readonly bookingId: string;
      readonly status: BookingStatus;
      readonly requesterId: string;
      readonly expectedVersion?: Date;
    },
  ) {}
}

export type UpdateBookingStatusCommandData =
  UpdateBookingStatusCommand['data'];

export type UpdateBookingStatusCommandReturnType = {
  bookingId: string;
};
