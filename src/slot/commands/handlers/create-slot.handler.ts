import { BadRequestException, Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateSlotCommand } from '../impl';
import { BaseSlotHandler } from './base-slot.handler';

@Injectable()
@CommandHandler(CreateSlotCommand)
export class CreateSlotHandler
  extends BaseSlotHandler
  implements ICommandHandler<CreateSlotCommand>
{
  async execute({ data }: CreateSlotCommand) {
    this.ensureTimeRange(data.startTime, data.endTime);
    this.ensurePrice(data.price);

    return this.runInTransaction(async () => {
      await this.ensureExpertExists(data.expertId);
      await this.ensureNoOverlap({
        expertId: data.expertId,
        startTime: data.startTime,
        endTime: data.endTime,
      });

      const existingSlot = await this.prisma.slot.findFirst({
        where: {
          expertId: data.expertId,
          startTime: data.startTime,
          endTime: data.endTime,
        },
        select: { id: true, isDeleted: true },
      });

      if (existingSlot && !existingSlot.isDeleted) {
        throw new BadRequestException('Slot already exists');
      }

      const persistResult = existingSlot
        ? await this.prisma.slot.update({
            where: { id: existingSlot.id },
            data: {
              description: data.description ?? null,
              price: data.price,
              format: data.format,
              isDeleted: false,
              isBooked: false,
            },
            select: { id: true },
          })
        : await this.prisma.slot.create({
            data: {
              expertId: data.expertId,
              startTime: data.startTime,
              endTime: data.endTime,
              description: data.description ?? null,
              price: data.price,
              format: data.format,
            },
            select: { id: true },
          });

      return { slotId: persistResult.id };
    });
  }
}
