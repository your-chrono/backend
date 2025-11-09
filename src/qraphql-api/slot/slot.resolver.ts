import { Args, Query, Resolver } from '@nestjs/graphql';
import { SlotApiService } from '../../slot/slot-api.service';
import { GetSlotInput, ListPublicSlotsInput } from './input';
import { SlotConnection, SlotModel } from './model';

@Resolver(() => SlotModel)
export class SlotResolver {
  constructor(private readonly slotApi: SlotApiService) {}

  @Query(() => SlotModel)
  slot(@Args('data') data: GetSlotInput) {
    return this.slotApi.getSlot(data);
  }

  @Query(() => SlotConnection)
  publicSlots(@Args('data') data: ListPublicSlotsInput) {
    return this.slotApi.listPublicSlots(data);
  }
}
