import { Slot, SlotFormat } from '@prisma/client';
import { IPaginatedType } from '../../../shared';

export class ListPublicSlotsQuery {
  constructor(
    public readonly data: {
      readonly expertId: string;
      readonly from?: Date;
      readonly to?: Date;
      readonly format?: SlotFormat;
      readonly minPrice?: number;
      readonly maxPrice?: number;
      readonly first: number;
      readonly after?: string;
    },
  ) {}
}

export type ListPublicSlotsQueryData = ListPublicSlotsQuery['data'];

export type ListPublicSlotsQueryReturnType = IPaginatedType<Slot>;
