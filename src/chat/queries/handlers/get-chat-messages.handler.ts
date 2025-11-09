import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import {
  MessageValidationService,
  PaginatedMessagesService,
} from '../../services';
import { GetChatMessagesQuery, GetChatMessagesQueryReturnType } from '../impl';

@QueryHandler(GetChatMessagesQuery)
export class GetChatMessagesHandler
  implements IQueryHandler<GetChatMessagesQuery, GetChatMessagesQueryReturnType>
{
  constructor(
    private readonly paginatedMessages: PaginatedMessagesService,
    private readonly messageValidation: MessageValidationService,
  ) {}

  async execute({ data }: GetChatMessagesQuery) {
    await this.messageValidation.ensureChatParticipant(
      data.chatId,
      data.requesterId,
    );

    return this.paginatedMessages.getMessagesConnection({
      chatId: data.chatId,
      first: data.first,
      after: data.after,
    });
  }
}
