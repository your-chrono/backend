import {
  CreateSlotHandler,
  DeleteSlotHandler,
  SetSlotBookingStateHandler,
  SyncSlotsHandler,
  UpdateSlotHandler,
} from './handlers';

export const SLOT_COMMANDS = [
  CreateSlotHandler,
  UpdateSlotHandler,
  DeleteSlotHandler,
  SyncSlotsHandler,
  SetSlotBookingStateHandler,
];

export * from './impl';
