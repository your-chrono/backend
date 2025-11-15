import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { BookingStatus } from '@prisma/client';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CompleteBookingCommand } from '../impl';
import { BaseBookingHandler } from './base-booking.handler';

@Injectable()
@CommandHandler(CompleteBookingCommand)
export class CompleteBookingHandler
  extends BaseBookingHandler
  implements ICommandHandler<CompleteBookingCommand>
{
  async execute({ data }: CompleteBookingCommand) {
    this.ensureValidExpectedVersion(data.expectedVersion);

    return this.runInTransaction(async () => {
      const booking = await this.findBookingOrThrow(data.bookingId);

      if (
        data.performedBy !== booking.userId &&
        data.performedBy !== booking.slot.expertId
      ) {
        throw new BadRequestException('Permission denied to complete booking');
      }

      if (
        data.expectedVersion &&
        booking.updatedAt.getTime() !== data.expectedVersion.getTime()
      ) {
        throw new ConflictException('Booking updated concurrently');
      }

      if (booking.status === BookingStatus.COMPLETED) {
        return { bookingId: booking.id };
      }

      if (booking.status !== BookingStatus.CONFIRMED) {
        throw new BadRequestException('Only confirmed booking can be completed');
      }

      if (booking.creditsLocked > 0) {
        await this.releaseBookingCredits({
          expertId: booking.slot.expertId,
          amount: booking.creditsLocked,
          bookingId: booking.id,
        });
      }

      await this.prisma.booking.update({
        where: { id: booking.id },
        data: {
          status: BookingStatus.COMPLETED,
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
