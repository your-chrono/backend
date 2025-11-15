import {
  BadRequestException,
  ConflictException,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { BookingStatus } from '@prisma/client';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ConfirmBookingCommand } from '../impl';
import { BaseBookingHandler } from './base-booking.handler';

@Injectable()
@CommandHandler(ConfirmBookingCommand)
export class ConfirmBookingHandler
  extends BaseBookingHandler
  implements ICommandHandler<ConfirmBookingCommand>
{
  async execute({ data }: ConfirmBookingCommand) {
    this.ensureValidExpectedVersion(data.expectedVersion);

    return this.runInTransaction(async () => {
      const booking = await this.findBookingOrThrow(data.bookingId);

      if (booking.slot.expertId !== data.requesterId) {
        throw new ForbiddenException('Only expert can confirm booking');
      }

      if (
        data.expectedVersion &&
        booking.updatedAt.getTime() !== data.expectedVersion.getTime()
      ) {
        throw new ConflictException('Booking updated concurrently');
      }

      if (booking.status === BookingStatus.CONFIRMED) {
        return { bookingId: booking.id };
      }

      if (booking.status !== BookingStatus.PENDING) {
        throw new BadRequestException('Booking cannot be confirmed');
      }

      await this.prisma.booking.update({
        where: { id: booking.id },
        data: { status: BookingStatus.CONFIRMED },
      });

      return { bookingId: booking.id };
    });
  }
}
