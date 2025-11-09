export class DeleteSlotCommand {
  constructor(
    public readonly data: {
      readonly slotId: string;
      readonly expertId: string;
      readonly reason?: string;
    },
  ) {}
}

export type DeleteSlotCommandData = DeleteSlotCommand['data'];

export type DeleteSlotCommandReturnType = { slotId: string };
