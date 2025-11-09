import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { BookingStatus } from '@prisma/client';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateBookingCommand } from '../impl';
import { BaseBookingHandler } from './base-booking.handler';

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

      this.ensureSufficientBalance(wallet.balance, slot.price);

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

      const booking = await this.prisma.booking.create({
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

      await this.prisma.slot.update({
        where: { id: slot.id },
        data: { isBooked: true },
      });

      return { bookingId: booking.id };
    });
  }
}
