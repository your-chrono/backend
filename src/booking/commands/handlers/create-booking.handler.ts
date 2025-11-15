import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { BookingStatus } from '@prisma/client';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateBookingCommand } from '../impl';
import { BaseBookingHandler } from './base-booking.handler';
import { MILLISECONDS_IN_HOUR } from '../../../shared/constants';

@Injectable()
@CommandHandler(CreateBookingCommand)
export class CreateBookingHandler
  extends BaseBookingHandler
  implements ICommandHandler<CreateBookingCommand>
{
  async execute({ data }: CreateBookingCommand) {
    return this.runInTransaction(async () => {
      await this.ensureUserExists(data.userId);

      const slot = await this.findSlotOrThrow(data.slotId);
      const wallet = await this.ensureWallet(data.userId);

      if (slot.expertId === data.userId) {
        throw new BadRequestException('Cannot book own slot');
      }

      if (slot.isBooked) {
        throw new ConflictException('Slot already booked');
      }

      // Validate slot time
      const now = new Date();
      if (slot.startTime < now) {
        throw new BadRequestException('Cannot book slot in the past');
      }

      // Minimum 1 hour before slot start
      const minBookingTime = MILLISECONDS_IN_HOUR; // 1 hour
      const timeUntilStart = slot.startTime.getTime() - now.getTime();
      if (timeUntilStart < minBookingTime) {
        throw new BadRequestException(
          'Slot must be booked at least 1 hour in advance',
        );
      }

      this.ensureSufficientBalance(wallet.balance, slot.price);

      // Check existing booking (defensive check before DB constraint)
      const existingBooking = await this.prisma.booking.findFirst({
        where: {
          slotId: slot.id,
          isDeleted: false,
        },
        select: { id: true },
      });

      if (existingBooking) {
        throw new ConflictException('Active booking already exists');
      }

      const chat = await this.prisma.chat.create({
        data: {},
        select: { id: true },
      });

      // Lock slot first to prevent race condition
      await this.prisma.slot.update({
        where: { id: slot.id },
        data: { isBooked: true },
      });

      let booking;
      try {
        booking = await this.prisma.booking.create({
          data: {
            slotId: slot.id,
            userId: data.userId,
            chatId: chat.id,
            creditsLocked: slot.price,
            status: BookingStatus.PENDING,
          },
          select: { id: true },
        });

        await this.lockBookingCredits({
          userId: data.userId,
          amount: slot.price,
          bookingId: booking.id,
        });

        return { bookingId: booking.id };
      } catch (error) {
        // Rollback slot.isBooked if booking creation fails
        await this.prisma.slot.update({
          where: { id: slot.id },
          data: { isBooked: false },
        });
        throw error;
      }
    });
  }
}
