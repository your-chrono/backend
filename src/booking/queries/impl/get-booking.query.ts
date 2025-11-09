import { Booking, Slot } from '@prisma/client';

export class GetBookingQuery {
  constructor(
    public readonly data: {
      readonly bookingId: string;
    },
  ) {}
}

export type GetBookingQueryData = GetBookingQuery['data'];

export type GetBookingQueryReturnType = Booking & {
  slot: Pick<Slot, 'expertId'>;
};
