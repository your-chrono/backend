import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  GetSlotQuery,
  GetSlotQueryData,
  GetSlotQueryReturnType,
  ListPublicSlotsQuery,
  ListPublicSlotsQueryData,
  ListPublicSlotsQueryReturnType,
} from './queries';
import {
  CreateSlotCommand,
  CreateSlotCommandData,
  DeleteSlotCommand,
  DeleteSlotCommandData,
  DeleteSlotCommandReturnType,
  SetSlotBookingStateCommand,
  SetSlotBookingStateCommandData,
  SetSlotBookingStateCommandReturnType,
  SyncSlotsCommand,
  SyncSlotsCommandData,
  SyncSlotsCommandReturnType,
  UpdateSlotCommand,
  UpdateSlotCommandData,
} from './commands';

@Injectable()
export class SlotApiService {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

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

  async createSlot(
    data: CreateSlotCommandData,
  ): Promise<GetSlotQueryReturnType> {
    const result = await this.commandBus.execute<
      CreateSlotCommand,
      { slotId: string }
    >(new CreateSlotCommand(data));

    return this.getSlot({ slotId: result.slotId });
  }

  async updateSlot(
    data: UpdateSlotCommandData,
  ): Promise<GetSlotQueryReturnType> {
    const result = await this.commandBus.execute<
      UpdateSlotCommand,
      { slotId: string }
    >(new UpdateSlotCommand(data));

    return this.getSlot({ slotId: result.slotId });
  }

  deleteSlot(data: DeleteSlotCommandData) {
    return this.commandBus.execute<
      DeleteSlotCommand,
      DeleteSlotCommandReturnType
    >(new DeleteSlotCommand(data));
  }

  syncSlots(data: SyncSlotsCommandData) {
    return this.commandBus.execute<
      SyncSlotsCommand,
      SyncSlotsCommandReturnType
    >(new SyncSlotsCommand(data));
  }

  async setSlotBookingState(
    data: SetSlotBookingStateCommandData,
  ): Promise<GetSlotQueryReturnType> {
    const result = await this.commandBus.execute<
      SetSlotBookingStateCommand,
      SetSlotBookingStateCommandReturnType
    >(new SetSlotBookingStateCommand(data));

    return this.getSlot({ slotId: result.slotId });
  }
}
