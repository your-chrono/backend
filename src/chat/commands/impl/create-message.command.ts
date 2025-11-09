import { Prisma } from '@prisma/client';

export class CreateMessageCommand {
  constructor(
    public readonly data: {
      chatId: string;
      userId: string;
      text?: string | null;
      meta?: Prisma.InputJsonValue | null;
      replyMessageId?: string | null;
    },
  ) {}
}

export type CreateMessageCommandData = CreateMessageCommand['data'];

export type CreateMessageCommandReturnType = {
  messageId: string;
};
