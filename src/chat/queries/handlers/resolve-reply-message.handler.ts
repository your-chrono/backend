import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Message } from '@prisma/client';
import { PrismaService } from '../../../database';
import { MessageValidationService } from '../../services/message-validation.service';
import { ResolveReplyMessageByMessageQuery } from '../impl';

@QueryHandler(ResolveReplyMessageByMessageQuery)
export class ResolveReplyMessageByMessageHandler
  implements IQueryHandler<ResolveReplyMessageByMessageQuery, Message | null>
{
  constructor(
    private readonly prisma: PrismaService,
    private readonly messageValidation: MessageValidationService,
  ) {}

  async execute({ data }: ResolveReplyMessageByMessageQuery) {
    const parent = await this.messageValidation.ensureMessageAccessible(
      data.messageId,
      data.requesterId,
    );

    if (!parent.replyMessageId) {
      return null;
    }

    const reply = await this.prisma.message.findUnique({
      where: { id: parent.replyMessageId },
    });

    if (!reply || reply.isDeleted) {
      return null;
    }

    return reply;
  }
}
