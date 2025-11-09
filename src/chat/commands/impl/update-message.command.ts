export class UpdateMessageCommand {
  constructor(
    public readonly data: {
      messageId: string;
      userId: string;
      text?: string | null;
    },
  ) {}
}

export type UpdateMessageCommandData = UpdateMessageCommand['data'];

export type UpdateMessageCommandReturnType = {
  messageId: string;
};
