import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { BookingStatus } from '@prisma/client';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CancelBookingCommand } from '../impl';
import { BaseBookingHandler } from './base-booking.handler';

@Injectable()
@CommandHandler(CancelBookingCommand)
export class CancelBookingHandler
  extends BaseBookingHandler
  implements ICommandHandler<CancelBookingCommand>
{
  async execute({ data }: CancelBookingCommand) {
    this.ensureValidExpectedVersion(data.expectedVersion);

    return this.runInTransaction(async () => {
      const booking = await this.findBookingOrThrow(data.bookingId);

      this.ensureRequesterAccess({
        requesterId: data.requesterId,
        userId: booking.userId,
        slot: booking.slot,
      });

      if (
        data.expectedVersion &&
        booking.updatedAt.getTime() !== data.expectedVersion.getTime()
      ) {
        throw new ConflictException('Booking updated concurrently');
      }

      if (booking.status === BookingStatus.CANCELLED) {
        return { bookingId: booking.id };
      }

      if (booking.status === BookingStatus.COMPLETED) {
        throw new BadRequestException('Completed booking cannot be cancelled');
      }

      if (
        booking.status !== BookingStatus.PENDING &&
        booking.status !== BookingStatus.CONFIRMED
      ) {
        throw new BadRequestException('Unsupported booking status');
      }

      if (booking.creditsLocked > 0) {
        await this.refundBookingCredits({
          userId: booking.userId,
          amount: booking.creditsLocked,
          bookingId: booking.id,
          description: data.reason,
        });
      }

      await this.prisma.booking.update({
        where: { id: booking.id },
        data: {
          status: BookingStatus.CANCELLED,
          creditsLocked: 0,
        },
      });

      await this.prisma.slot.update({
        where: { id: booking.slotId },
        data: { isBooked: false },
      });

      return { bookingId: booking.id };
    });
  }
}
