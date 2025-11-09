import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  UpdateMessageCommand,
  UpdateMessageCommandReturnType,
} from '../impl';
import { MessageService } from '../../services/message.service';
import { MessageValidationService } from '../../services/message-validation.service';

@CommandHandler(UpdateMessageCommand)
export class UpdateMessageHandler
  implements ICommandHandler<UpdateMessageCommand, UpdateMessageCommandReturnType>
{
  constructor(
    private readonly messageService: MessageService,
    private readonly messageValidation: MessageValidationService,
  ) {}

  async execute({ data }: UpdateMessageCommand) {
    const message = await this.messageValidation.ensureMessageOwner(
      data.messageId,
      data.userId,
    );

    if (data.text !== undefined) {
      this.messageValidation.ensureMessageHasContent(data.text, null);
      this.messageValidation.ensureTextWithinLimit(data.text);
    }

    await this.messageService.updateMessage({
      messageId: message.id,
      text: data.text,
    });

    return { messageId: message.id };
  }
}
