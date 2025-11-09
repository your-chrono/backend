import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database';

type CreateMessageData = {
  chatId: string;
  userId: string;
  text?: string | null;
  meta?: Prisma.InputJsonValue | null;
  replyMessageId?: string | null;
};

type UpdateMessageData = {
  messageId: string;
  text?: string | null;
};

@Injectable()
export class MessageService {
  constructor(private readonly prisma: PrismaService) {}

  createMessage(data: CreateMessageData) {
    return this.prisma.message.create({
      data: {
        chatId: data.chatId,
        userId: data.userId,
        text: data.text,
        meta: data.meta ?? undefined,
        replyMessageId: data.replyMessageId ?? undefined,
      },
    });
  }

  updateMessage(data: UpdateMessageData) {
    return this.prisma.message.update({
      where: { id: data.messageId },
      data: {
        text: data.text,
      },
    });
  }

  softDeleteMessage(messageId: string) {
    return this.prisma.message.update({
      where: { id: messageId },
      data: {
        isDeleted: true,
        text: null,
      },
    });
  }
}
