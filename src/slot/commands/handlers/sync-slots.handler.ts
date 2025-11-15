import { BadRequestException, Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  SyncSlotPayload,
  SyncSlotsCommand,
  SyncSlotsCommandData,
} from '../impl';
import { BaseSlotHandler } from './base-slot.handler';

@CommandHandler(SyncSlotsCommand)
@Injectable()
export class SyncSlotsHandler
  extends BaseSlotHandler
  implements ICommandHandler<SyncSlotsCommand>
{
  async execute({ data }: SyncSlotsCommand) {
    this.ensureWindow(data.window);
    const slots = this.normalizeSlots(data);

    return this.runInTransaction(async () => {
      await this.ensureExpertExists(data.expertId);

      const windowSlots = await this.prisma.slot.findMany({
        where: {
          expertId: data.expertId,
          startTime: { gte: data.window.from, lt: data.window.to },
        },
      });

      const slotsByKey = new Map(
        windowSlots.map((slot) => [
          this.getSlotKey(slot.startTime, slot.endTime),
          slot,
        ]),
      );

      let created = 0;
      let updated = 0;

      for (const slotPayload of slots) {
        const key = this.getSlotKey(slotPayload.startTime, slotPayload.endTime);

        await this.ensureNoOverlap({
          expertId: data.expertId,
          startTime: slotPayload.startTime,
          endTime: slotPayload.endTime,
          excludeSlotId: slotsByKey.get(key)?.id,
        });

        const existing = slotsByKey.get(key);

        if (existing) {
          slotsByKey.delete(key);

          if (existing.isBooked) {
            this.ensureUnchanged(existing, slotPayload);
            continue;
          }

          const shouldRevive = existing.isDeleted;
          const shouldUpdate =
            shouldRevive ||
            existing.price !== slotPayload.price ||
            existing.format !== slotPayload.format ||
            (existing.description ?? null) !==
              (slotPayload.description ?? null);

          if (shouldUpdate) {
            await this.prisma.slot.update({
              where: { id: existing.id },
              data: {
                price: slotPayload.price,
                format: slotPayload.format,
                description: slotPayload.description ?? null,
                isDeleted: false,
              },
            });
            updated += 1;
          }

          continue;
        }

        await this.prisma.slot.create({
          data: {
            expertId: data.expertId,
            startTime: slotPayload.startTime,
            endTime: slotPayload.endTime,
            price: slotPayload.price,
            format: slotPayload.format,
            description: slotPayload.description ?? null,
          },
        });
        created += 1;
      }

      let deleted = 0;

      for (const remaining of slotsByKey.values()) {
        if (remaining.isDeleted) {
          continue;
        }

        if (remaining.isBooked) {
          throw new BadRequestException(
            'Cannot delete booked slot during sync',
          );
        }

        await this.prisma.slot.update({
          where: { id: remaining.id },
          data: { isDeleted: true },
        });
        deleted += 1;
      }

      return { created, updated, deleted };
    });
  }

  private ensureWindow(window: SyncSlotsCommandData['window']) {
    if (window.from >= window.to) {
      throw new BadRequestException('window.from must be before window.to');
    }
  }

  private normalizeSlots(data: SyncSlotsCommandData) {
    const map = new Map<string, SyncSlotPayload>();

    for (const slot of data.slots) {
      this.ensureTimeRange(slot.startTime, slot.endTime);
      this.ensurePrice(slot.price);
      this.ensureDescription(slot.description);

      if (slot.startTime < data.window.from || slot.endTime > data.window.to) {
        throw new BadRequestException('Slot is outside of provided window');
      }

      const key = this.getSlotKey(slot.startTime, slot.endTime);

      if (map.has(key)) {
        throw new BadRequestException('Duplicate slot in payload');
      }

      map.set(key, slot);
    }

    const normalized = Array.from(map.values()).sort(
      (left, right) => left.startTime.getTime() - right.startTime.getTime(),
    );

    for (let index = 1; index < normalized.length; index += 1) {
      const prev = normalized[index - 1];
      const next = normalized[index];

      if (prev.endTime > next.startTime) {
        throw new BadRequestException('Payload slots overlap each other');
      }
    }

    return normalized;
  }

  private getSlotKey(startTime: Date, endTime: Date) {
    return `${startTime.toISOString()}_${endTime.toISOString()}`;
  }

  private ensureUnchanged(
    existing: {
      price: number;
      format: SyncSlotPayload['format'];
      description: string | null;
    },
    slotPayload: SyncSlotPayload,
  ) {
    if (
      existing.price !== slotPayload.price ||
      existing.format !== slotPayload.format ||
      (existing.description ?? null) !== (slotPayload.description ?? null)
    ) {
      throw new BadRequestException('Booked slot cannot be modified');
    }
  }
}
