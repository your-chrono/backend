import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SetSlotBookingStateCommand } from '../impl';
import { BaseSlotHandler } from './base-slot.handler';

@Injectable()
@CommandHandler(SetSlotBookingStateCommand)
export class SetSlotBookingStateHandler
  extends BaseSlotHandler
  implements ICommandHandler<SetSlotBookingStateCommand>
{
  async execute({ data }: SetSlotBookingStateCommand) {
    return this.runInTransaction(async () => {
      const slot = await this.prisma.slot.findFirst({
        where: { id: data.slotId },
        select: { id: true, isBooked: true, isDeleted: true, updatedAt: true },
      });

      if (!slot) {
        throw new NotFoundException('Slot not found');
      }

      if (slot.isDeleted) {
        throw new BadRequestException('Cannot update a deleted slot');
      }

      if (
        data.expectedVersion &&
        slot.updatedAt.getTime() !== data.expectedVersion.getTime()
      ) {
        throw new ConflictException('Slot has been updated by another process');
      }

      if (slot.isBooked === data.isBooked) {
        return { slotId: slot.id, isBooked: slot.isBooked };
      }

      const result = await this.prisma.slot.update({
        where: { id: slot.id },
        data: { isBooked: data.isBooked },
        select: { id: true, isBooked: true },
      });

      return result;
    });
  }
}
