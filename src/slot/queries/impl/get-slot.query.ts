import { Slot } from '@prisma/client';

export class GetSlotQuery {
  constructor(
    public readonly data: {
      readonly slotId: string;
    },
  ) {}
}

export type GetSlotQueryData = GetSlotQuery['data'];

export type GetSlotQueryReturnType = Slot;
