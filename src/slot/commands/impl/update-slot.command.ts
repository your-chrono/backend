import { SlotFormat } from '@prisma/client';

export class UpdateSlotCommand {
  constructor(
    public readonly data: {
      readonly slotId: string;
      readonly expertId: string;
      readonly startTime?: Date;
      readonly endTime?: Date;
      readonly price?: number;
      readonly format?: SlotFormat;
      readonly description?: string;
    },
  ) {}
}

export type UpdateSlotCommandData = UpdateSlotCommand['data'];

export type UpdateSlotCommandReturnType = { slotId: string };
