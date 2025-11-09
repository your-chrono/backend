import { SlotFormat } from '@prisma/client';

export type SyncSlotPayload = {
  readonly startTime: Date;
  readonly endTime: Date;
  readonly price: number;
  readonly format: SlotFormat;
  readonly description?: string;
};

export class SyncSlotsCommand {
  constructor(
    public readonly data: {
      readonly expertId: string;
      readonly window: {
        readonly from: Date;
        readonly to: Date;
      };
      readonly slots: readonly SyncSlotPayload[];
    },
  ) {}
}

export type SyncSlotsCommandData = SyncSlotsCommand['data'];

export type SyncSlotsCommandReturnType = {
  created: number;
  updated: number;
  deleted: number;
};
