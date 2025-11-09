export class DeleteMessageCommand {
  constructor(
    public readonly data: {
      messageId: string;
      userId: string;
    },
  ) {}
}

export type DeleteMessageCommandData = DeleteMessageCommand['data'];

export type DeleteMessageCommandReturnType = {
  success: boolean;
};
