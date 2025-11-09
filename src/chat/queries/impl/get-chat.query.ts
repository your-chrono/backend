export class GetChatQuery {
  constructor(
    public readonly data: {
      chatId: string;
      requesterId: string;
    },
  ) {}
}

export type GetChatQueryData = GetChatQuery['data'];
