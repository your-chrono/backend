import { NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Chat } from '@prisma/client';
import { PrismaService } from '../../../database';
import { MessageValidationService } from '../../services/message-validation.service';
import { GetChatQuery } from '../impl';

@QueryHandler(GetChatQuery)
export class GetChatHandler implements IQueryHandler<GetChatQuery, Chat> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly messageValidation: MessageValidationService,
  ) {}

  async execute({ data }: GetChatQuery) {
    const chat = await this.prisma.chat.findUnique({
      where: { id: data.chatId },
      include: {
        booking: {
          select: { id: true },
        },
      },
    });

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    await this.messageValidation.ensureChatParticipant(
      chat.id,
      data.requesterId,
    );

    return {
      ...chat,
      bookingId: chat.booking?.id,
    } as Chat & { bookingId?: string | null };
  }
}
