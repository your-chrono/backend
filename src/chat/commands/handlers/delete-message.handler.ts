import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  DeleteMessageCommand,
  DeleteMessageCommandReturnType,
} from '../impl';
import { MessageService } from '../../services/message.service';
import { MessageValidationService } from '../../services/message-validation.service';

@CommandHandler(DeleteMessageCommand)
export class DeleteMessageHandler
  implements ICommandHandler<DeleteMessageCommand, DeleteMessageCommandReturnType>
{
  constructor(
    private readonly messageService: MessageService,
    private readonly messageValidation: MessageValidationService,
  ) {}

  async execute({ data }: DeleteMessageCommand) {
    await this.messageValidation.ensureMessageOwner(data.messageId, data.userId);
    await this.messageService.softDeleteMessage(data.messageId);

    return { success: true };
  }
}
