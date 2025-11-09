export class ResolveReplyMessageByMessageQuery {
  constructor(
    public readonly data: {
      messageId: string;
      requesterId: string;
    },
  ) {}
}

export type ResolveReplyMessageByMessageQueryData =
  ResolveReplyMessageByMessageQuery['data'];
