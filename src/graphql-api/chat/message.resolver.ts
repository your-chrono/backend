import { UseGuards } from '@nestjs/common';
import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { Prisma } from '@prisma/client';
import { ChatApiService } from '../../chat/chat-api.service';
import { GqlAuthGuard } from '../../auth/gql-auth.guard';
import { CurrentUser } from '../current-user.decorator';
import { UserType } from '../../auth/types';
import {
  CreateMessageInput,
  DeleteMessageInput,
  GetMessageInput,
  GetMessagesInput,
  UpdateMessageInput,
} from './input';
import { MessageModel, MessagesConnection } from './model';

@UseGuards(GqlAuthGuard)
@Resolver(() => MessageModel)
export class MessageResolver {
  constructor(private readonly chatApi: ChatApiService) {}

  @Query(() => MessagesConnection)
  chatMessages(
    @Args('data') data: GetMessagesInput,
    @CurrentUser() user: UserType,
  ) {
    return this.chatApi.messages({
      ...data,
      requesterId: user.userId,
    });
  }

  @Query(() => MessageModel)
  message(
    @Args('data') data: GetMessageInput,
    @CurrentUser() user: UserType,
  ) {
    return this.chatApi.message({
      ...data,
      requesterId: user.userId,
    });
  }

  @Mutation(() => MessageModel)
  async createMessage(
    @Args('data') data: CreateMessageInput,
    @CurrentUser() user: UserType,
  ) {
    const { messageId } = await this.chatApi.createMessage({
      ...data,
      meta: data.meta as Prisma.InputJsonValue,
      userId: user.userId,
    });

    return this.chatApi.message({
      messageId,
      requesterId: user.userId,
    });
  }

  @Mutation(() => MessageModel)
  async updateMessage(
    @Args('data') data: UpdateMessageInput,
    @CurrentUser() user: UserType,
  ) {
    await this.chatApi.updateMessage({
      ...data,
      userId: user.userId,
    });

    return this.chatApi.message({
      messageId: data.messageId,
      requesterId: user.userId,
    });
  }

  @Mutation(() => Boolean)
  deleteMessage(
    @Args('data') data: DeleteMessageInput,
    @CurrentUser() user: UserType,
  ) {
    return this.chatApi
      .deleteMessage({
        ...data,
        userId: user.userId,
      })
      .then(() => true);
  }

  @ResolveField(() => MessageModel, { nullable: true })
  replyMessage(@Parent() parent: MessageModel, @CurrentUser() user: UserType) {
    if (!parent.replyMessageId) {
      return null;
    }

    return this.chatApi.resolveReplyMessageByMessage({
      messageId: parent.id,
      requesterId: user.userId,
    });
  }
}
