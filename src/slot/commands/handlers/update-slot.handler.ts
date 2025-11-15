import { BadRequestException, Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateSlotCommand, UpdateSlotCommandData } from '../impl';
import { BaseSlotHandler } from './base-slot.handler';
import { MILLISECONDS_IN_WORKING_DAY } from '../../../shared/constants';

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

      // Validate dates are valid
      if (data.startTime !== undefined) {
        if (!data.startTime || isNaN(data.startTime.getTime())) {
          throw new BadRequestException('startTime must be a valid date');
        }
      }

      if (data.endTime !== undefined) {
        if (!data.endTime || isNaN(data.endTime.getTime())) {
          throw new BadRequestException('endTime must be a valid date');
        }
      }

      // Validate new startTime is not in the past (only if changing)
      if (data.startTime !== undefined) {
        const now = new Date();
        if (data.startTime < now) {
          throw new BadRequestException('startTime cannot be in the past');
        }
      }

      // Validate time range
      if (nextStartTime >= nextEndTime) {
        throw new BadRequestException('startTime must be before endTime');
      }

      // Validate duration
      const maxDuration = MILLISECONDS_IN_WORKING_DAY;
      const duration = nextEndTime.getTime() - nextStartTime.getTime();
      if (duration > maxDuration) {
        throw new BadRequestException(
          'Slot duration cannot exceed 8 hours',
        );
      }

      if (data.price !== undefined) {
        this.ensurePrice(data.price);
      }

      if (data.description !== undefined) {
        this.ensureDescription(data.description);
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
