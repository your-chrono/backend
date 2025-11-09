import { Injectable } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import {
  GetSlotQuery,
  GetSlotQueryData,
  GetSlotQueryReturnType,
  ListPublicSlotsQuery,
  ListPublicSlotsQueryData,
  ListPublicSlotsQueryReturnType,
} from './queries';

@Injectable()
export class SlotApiService {
  constructor(private readonly queryBus: QueryBus) {}

  getSlot(data: GetSlotQueryData) {
    return this.queryBus.execute<GetSlotQuery, GetSlotQueryReturnType>(
      new GetSlotQuery(data),
    );
  }

  listPublicSlots(data: ListPublicSlotsQueryData) {
    return this.queryBus.execute<
      ListPublicSlotsQuery,
      ListPublicSlotsQueryReturnType
    >(new ListPublicSlotsQuery(data));
  }
}
