import { SlotFormat } from '@prisma/client';

export class CreateSlotCommand {
  constructor(
    public readonly data: {
      readonly expertId: string;
      readonly startTime: Date;
      readonly endTime: Date;
      readonly price: number;
      readonly format: SlotFormat;
      readonly description?: string;
    },
  ) {}
}

export type CreateSlotCommandData = CreateSlotCommand['data'];

export type CreateSlotCommandReturnType = { slotId: string };
