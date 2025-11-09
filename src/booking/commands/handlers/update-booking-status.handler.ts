import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { BookingStatus } from '@prisma/client';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateBookingStatusCommand } from '../impl';
import { BaseBookingHandler } from './base-booking.handler';

const ALLOWED_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  [BookingStatus.PENDING]: [BookingStatus.CONFIRMED, BookingStatus.CANCELLED],
  [BookingStatus.CONFIRMED]: [
    BookingStatus.COMPLETED,
    BookingStatus.CANCELLED,
  ],
  [BookingStatus.CANCELLED]: [],
  [BookingStatus.COMPLETED]: [],
};

@Injectable()
@CommandHandler(UpdateBookingStatusCommand)
export class UpdateBookingStatusHandler
  extends BaseBookingHandler
  implements ICommandHandler<UpdateBookingStatusCommand>
{
  async execute({ data }: UpdateBookingStatusCommand) {
    return this.runInTransaction(async () => {
      const booking = await this.findBookingOrThrow(data.bookingId);

      this.ensureRequesterAccess({
        userId: booking.userId,
        slot: booking.slot,
        requesterId: data.requesterId,
      });

      if (
        data.expectedVersion &&
        booking.updatedAt.getTime() !== data.expectedVersion.getTime()
      ) {
        throw new ConflictException('Booking updated concurrently');
      }

      if (booking.status === data.status) {
        return { bookingId: booking.id };
      }

      if (!ALLOWED_TRANSITIONS[booking.status].includes(data.status)) {
        throw new BadRequestException('Unsupported booking status transition');
      }

      await this.prisma.booking.update({
        where: { id: booking.id },
        data: { status: data.status },
      });

      if (data.status === BookingStatus.CANCELLED) {
        await this.prisma.slot.update({
          where: { id: booking.slotId },
          data: { isBooked: false },
        });
      }

      return { bookingId: booking.id };
    });
  }
}
