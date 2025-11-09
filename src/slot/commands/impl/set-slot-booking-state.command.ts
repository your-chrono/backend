export class SetSlotBookingStateCommand {
  constructor(
    public readonly data: {
      readonly slotId: string;
      readonly isBooked: boolean;
      readonly expectedVersion?: Date;
    },
  ) {}
}

export type SetSlotBookingStateCommandData = SetSlotBookingStateCommand['data'];

export type SetSlotBookingStateCommandReturnType = {
  slotId: string;
  isBooked: boolean;
};
