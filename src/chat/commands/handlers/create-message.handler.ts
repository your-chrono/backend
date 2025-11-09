import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  CreateMessageCommand,
  CreateMessageCommandReturnType,
} from '../impl';
import { MessageService } from '../../services/message.service';
import { MessageValidationService } from '../../services/message-validation.service';

@CommandHandler(CreateMessageCommand)
export class CreateMessageHandler
  implements ICommandHandler<CreateMessageCommand, CreateMessageCommandReturnType>
{
  constructor(
    private readonly messageService: MessageService,
    private readonly messageValidation: MessageValidationService,
  ) {}

  async execute({ data }: CreateMessageCommand) {
    await this.messageValidation.ensureChatParticipant(data.chatId, data.userId);
    this.messageValidation.ensureMessageHasContent(data.text, data.meta);
    this.messageValidation.ensureTextWithinLimit(data.text);

    if (data.replyMessageId) {
      await this.messageValidation.ensureReplyBelongsToChat(
        data.chatId,
        data.replyMessageId,
      );
    }

    const message = await this.messageService.createMessage({
      chatId: data.chatId,
      userId: data.userId,
      text: data.text,
      meta: data.meta,
      replyMessageId: data.replyMessageId,
    });

    return { messageId: message.id };
  }
}
