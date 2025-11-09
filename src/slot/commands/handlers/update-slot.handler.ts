import { BadRequestException, Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateSlotCommand, UpdateSlotCommandData } from '../impl';
import { BaseSlotHandler } from './base-slot.handler';

@Injectable()
@CommandHandler(UpdateSlotCommand)
export class UpdateSlotHandler
  extends BaseSlotHandler
  implements ICommandHandler<UpdateSlotCommand>
{
  async execute({ data }: UpdateSlotCommand) {
    this.ensurePayload(data);

    return this.runInTransaction(async () => {
      const slot = await this.findSlotOrThrow(data.slotId, data.expertId);

      if (slot.isBooked) {
        throw new BadRequestException('Booked slot cannot be updated');
      }

      const nextStartTime = data.startTime ?? slot.startTime;
      const nextEndTime = data.endTime ?? slot.endTime;

      this.ensureTimeRange(nextStartTime, nextEndTime);

      if (data.price !== undefined) {
        this.ensurePrice(data.price);
      }

      if (data.startTime !== undefined || data.endTime !== undefined) {
        await this.ensureNoOverlap({
          expertId: data.expertId,
          startTime: nextStartTime,
          endTime: nextEndTime,
          excludeSlotId: slot.id,
        });
      }

      const patch: Parameters<typeof this.prisma.slot.update>[0]['data'] = {};

      if (data.startTime !== undefined) {
        patch.startTime = nextStartTime;
      }

      if (data.endTime !== undefined) {
        patch.endTime = nextEndTime;
      }

      if (data.price !== undefined) {
        patch.price = data.price;
      }

      if (data.format !== undefined) {
        patch.format = data.format;
      }

      if (data.description !== undefined) {
        patch.description = data.description ?? null;
      }

      const result = await this.prisma.slot.update({
        where: { id: slot.id },
        data: patch,
        select: { id: true },
      });

      return { slotId: result.id };
    });
  }

  private ensurePayload(data: UpdateSlotCommandData) {
    if (
      data.startTime === undefined &&
      data.endTime === undefined &&
      data.price === undefined &&
      data.format === undefined &&
      data.description === undefined
    ) {
      throw new BadRequestException('No slot fields provided for update');
    }
  }
}
