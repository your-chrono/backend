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
  CreateSlotCommandReturnType,
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
  UpdateSlotCommandReturnType,
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
  ): Promise<CreateSlotCommandReturnType> {
    return this.commandBus.execute<CreateSlotCommand, { slotId: string }>(
      new CreateSlotCommand(data),
    );
  }

  async updateSlot(
    data: UpdateSlotCommandData,
  ): Promise<UpdateSlotCommandReturnType> {
    return this.commandBus.execute<UpdateSlotCommand, { slotId: string }>(
      new UpdateSlotCommand(data),
    );
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

  async setSlotBookingState(data: SetSlotBookingStateCommandData) {
    return this.commandBus.execute<
      SetSlotBookingStateCommand,
      SetSlotBookingStateCommandReturnType
    >(new SetSlotBookingStateCommand(data));
  }
}
