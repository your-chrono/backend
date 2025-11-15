import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards, NotFoundException } from '@nestjs/common';
import { SlotApiService } from '../../slot/slot-api.service';
import {
  CreateSlotInput,
  DeleteSlotInput,
  GetSlotInput,
  ListPublicSlotsInput,
  SetSlotBookingStateInput,
  SyncSlotsInput,
  UpdateSlotInput,
} from './input';
import {
  SlotConnection,
  SlotModel,
  SlotMutationPayload,
  SyncSlotsPayload,
} from './model';
import { GqlAuthGuard } from '../../auth/gql-auth.guard';
import { CurrentUser } from '../current-user.decorator';
import { UserType } from '../../auth/types';

@UseGuards(GqlAuthGuard)
@Resolver(() => SlotModel)
export class SlotResolver {
  constructor(private readonly slotApi: SlotApiService) {}

  @Query(() => SlotModel)
  async slot(@CurrentUser() user: UserType, @Args('data') data: GetSlotInput) {
    const slot = await this.slotApi.getSlot(data).catch(() => null);

    if (!slot || slot.expertId !== user.userId) {
      throw new NotFoundException('Slot not found');
    }

    return slot;
  }

  @Query(() => SlotConnection)
  publicSlots(@Args('data') data: ListPublicSlotsInput) {
    return this.slotApi.listPublicSlots(data);
  }

  @Mutation(() => SlotModel)
  async createMySlot(
    @CurrentUser() user: UserType,
    @Args('data') data: CreateSlotInput,
  ) {
    const result = await this.slotApi.createSlot({
      expertId: user.userId,
      ...data,
    });
    return this.slotApi.getSlot({ slotId: result.slotId });
  }

  @Mutation(() => SlotModel)
  async updateMySlot(
    @CurrentUser() user: UserType,
    @Args('data') data: UpdateSlotInput,
  ) {
    const result = await this.slotApi.updateSlot({
      expertId: user.userId,
      ...data,
    });
    return this.slotApi.getSlot({ slotId: result.slotId });
  }

  @Mutation(() => SlotMutationPayload)
  deleteMySlot(
    @CurrentUser() user: UserType,
    @Args('data') data: DeleteSlotInput,
  ) {
    return this.slotApi.deleteSlot({
      expertId: user.userId,
      ...data,
    });
  }

  @Mutation(() => SyncSlotsPayload)
  syncMySlots(
    @CurrentUser() user: UserType,
    @Args('data') data: SyncSlotsInput,
  ) {
    return this.slotApi.syncSlots({
      expertId: user.userId,
      ...data,
    });
  }

  @Mutation(() => SlotModel)
  async setSlotBookingState(@Args('data') data: SetSlotBookingStateInput) {
    const result = await this.slotApi.setSlotBookingState(data);

    return this.slotApi.getSlot({ slotId: result.slotId });
  }
}
