import { Message } from '@prisma/client';
import { IPaginatedType } from '../../../shared/types';

export class GetChatMessagesQuery {
  constructor(
    public readonly data: {
      chatId: string;
      requesterId: string;
      first: number;
      after?: string;
    },
  ) {}
}

export type GetChatMessagesQueryData = GetChatMessagesQuery['data'];

export type GetChatMessagesQueryReturnType = IPaginatedType<Message>;
