import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database';
import { MAX_MESSAGE_LENGTH } from '../constants';

@Injectable()
export class MessageValidationService {
  constructor(private readonly prisma: PrismaService) {}

  async ensureChatParticipant(chatId: string, userId: string) {
    const booking = await this.prisma.booking.findFirst({
      where: {
        chatId,
        isDeleted: false,
      },
      select: {
        userId: true,
        slot: {
          select: { expertId: true },
        },
      },
    });

    if (!booking) {
      throw new NotFoundException('Chat not found');
    }

    const isParticipant =
      booking.userId === userId || booking.slot.expertId === userId;

    if (!isParticipant) {
      throw new ForbiddenException('Chat access denied');
    }
  }

  async ensureReplyBelongsToChat(chatId: string, replyMessageId: string) {
    const reply = await this.prisma.message.findFirst({
      where: {
        id: replyMessageId,
        isDeleted: false,
      },
      select: { chatId: true },
    });

    if (!reply) {
      throw new NotFoundException('Reply message not found');
    }

    if (reply.chatId !== chatId) {
      throw new ForbiddenException('Reply message belongs to another chat');
    }
  }

  ensureMessageHasContent(text?: string | null, meta?: unknown) {
    if (!text && meta == null) {
      throw new BadRequestException('Message must contain text or metadata');
    }
  }

  ensureTextWithinLimit(text?: string | null) {
    if (!text) return;
    if (text.length > MAX_MESSAGE_LENGTH) {
      throw new BadRequestException('Message is too long');
    }
  }

  async ensureMessageOwner(messageId: string, userId: string) {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
      select: {
        id: true,
        userId: true,
        isDeleted: true,
        chatId: true,
      },
    });

    if (!message || message.isDeleted) {
      throw new NotFoundException('Message not found');
    }

    if (message.userId !== userId) {
      throw new ForbiddenException('Cannot modify message of another user');
    }

    return message;
  }

  async ensureMessageAccessible(messageId: string, requesterId: string) {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message || message.isDeleted) {
      throw new NotFoundException('Message not found');
    }

    await this.ensureChatParticipant(message.chatId, requesterId);

    return message;
  }
}
