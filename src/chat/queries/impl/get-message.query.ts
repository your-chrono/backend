export class GetMessageQuery {
  constructor(
    public readonly data: {
      messageId: string;
      requesterId: string;
    },
  ) {}
}

export type GetMessageQueryData = GetMessageQuery['data'];
