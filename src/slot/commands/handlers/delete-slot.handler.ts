import { BadRequestException, Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeleteSlotCommand } from '../impl';
import { BaseSlotHandler } from './base-slot.handler';

@Injectable()
@CommandHandler(DeleteSlotCommand)
export class DeleteSlotHandler
  extends BaseSlotHandler
  implements ICommandHandler<DeleteSlotCommand>
{
  async execute({ data }: DeleteSlotCommand) {
    return this.runInTransaction(async () => {
      const slot = await this.findSlotOrThrow(data.slotId, data.expertId);

      if (slot.isBooked) {
        throw new BadRequestException('Booked slot cannot be deleted');
      }

      const result = await this.prisma.slot.update({
        where: { id: slot.id },
        data: { isDeleted: true },
        select: { id: true },
      });

      return { slotId: result.id };
    });
  }
}
