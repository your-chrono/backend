import { NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Message } from '@prisma/client';
import { PrismaService } from '../../../database';
import { MessageValidationService } from '../../services/message-validation.service';
import { GetMessageQuery } from '../impl';

@QueryHandler(GetMessageQuery)
export class GetMessageHandler
  implements IQueryHandler<GetMessageQuery, Message>
{
  constructor(
    private readonly prisma: PrismaService,
    private readonly messageValidation: MessageValidationService,
  ) {}

  async execute({ data }: GetMessageQuery) {
    const message = await this.prisma.message.findUnique({
      where: { id: data.messageId },
    });

    if (!message || message.isDeleted) {
      throw new NotFoundException('Message not found');
    }

    await this.messageValidation.ensureChatParticipant(
      message.chatId,
      data.requesterId,
    );

    return message;
  }
}
