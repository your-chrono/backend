import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  CreateMessageCommand,
  CreateMessageCommandData,
  CreateMessageCommandReturnType,
  DeleteMessageCommand,
  DeleteMessageCommandData,
  DeleteMessageCommandReturnType,
  UpdateMessageCommand,
  UpdateMessageCommandData,
  UpdateMessageCommandReturnType,
} from './commands';
import {
  GetChatMessagesQuery,
  GetChatMessagesQueryData,
  GetChatMessagesQueryReturnType,
  GetChatQuery,
  GetChatQueryData,
  GetMessageQuery,
  GetMessageQueryData,
  ResolveReplyMessageByMessageQuery,
  ResolveReplyMessageByMessageQueryData,
} from './queries';
import { Chat, Message } from '@prisma/client';

@Injectable()
export class ChatApiService {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  chat(data: GetChatQueryData): Promise<Chat> {
    return this.queryBus.execute(new GetChatQuery(data));
  }

  messages(
    data: GetChatMessagesQueryData,
  ): Promise<GetChatMessagesQueryReturnType> {
    return this.queryBus.execute(new GetChatMessagesQuery(data));
  }

  message(data: GetMessageQueryData): Promise<Message> {
    return this.queryBus.execute(new GetMessageQuery(data));
  }

  resolveReplyMessageByMessage(
    data: ResolveReplyMessageByMessageQueryData,
  ): Promise<Message | null> {
    return this.queryBus.execute(
      new ResolveReplyMessageByMessageQuery(data),
    );
  }

  createMessage(
    data: CreateMessageCommandData,
  ): Promise<CreateMessageCommandReturnType> {
    return this.commandBus.execute(new CreateMessageCommand(data));
  }

  updateMessage(
    data: UpdateMessageCommandData,
  ): Promise<UpdateMessageCommandReturnType> {
    return this.commandBus.execute(new UpdateMessageCommand(data));
  }

  deleteMessage(
    data: DeleteMessageCommandData,
  ): Promise<DeleteMessageCommandReturnType> {
    return this.commandBus.execute(new DeleteMessageCommand(data));
  }
}
