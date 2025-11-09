import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards, ForbiddenException } from '@nestjs/common';
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
    const slot = await this.slotApi.getSlot(data);

    if (slot.expertId !== user.userId) {
      throw new ForbiddenException('Slot not found');
    }

    return slot;
  }

  @Query(() => SlotConnection)
  publicSlots(@Args('data') data: ListPublicSlotsInput) {
    return this.slotApi.listPublicSlots(data);
  }

  @Mutation(() => SlotModel)
  createMySlot(
    @CurrentUser() user: UserType,
    @Args('data') data: CreateSlotInput,
  ) {
    return this.slotApi.createSlot({
      expertId: user.userId,
      ...data,
    });
  }

  @Mutation(() => SlotModel)
  updateMySlot(
    @CurrentUser() user: UserType,
    @Args('data') data: UpdateSlotInput,
  ) {
    return this.slotApi.updateSlot({
      expertId: user.userId,
      ...data,
    });
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
  setSlotBookingState(@Args('data') data: SetSlotBookingStateInput) {
    return this.slotApi.setSlotBookingState(data);
  }
}
