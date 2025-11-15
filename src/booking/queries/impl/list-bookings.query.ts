import { Booking, BookingStatus } from '@prisma/client';
import { IPaginatedType } from '../../../shared';

export class ListBookingsQuery {
  constructor(
    public readonly data: {
      readonly userId?: string;
      readonly expertId?: string;
      readonly status?: BookingStatus;
      readonly first: number;
      readonly after?: string;
      readonly requesterId: string;
    },
  ) {}
}

export type ListBookingsQueryData = ListBookingsQuery['data'];

export type ListBookingsQueryReturnType = IPaginatedType<Booking>;
