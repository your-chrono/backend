import { UseGuards } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';
import { ChatApiService } from '../../chat/chat-api.service';
import { GqlAuthGuard } from '../../auth/gql-auth.guard';
import { CurrentUser } from '../current-user.decorator';
import { UserType } from '../../auth/types';
import { ChatModel } from './model';
import { GetChatInput } from './input';

@UseGuards(GqlAuthGuard)
@Resolver(() => ChatModel)
export class ChatResolver {
  constructor(private readonly chatApi: ChatApiService) {}

  @Query(() => ChatModel)
  chat(@Args('data') data: GetChatInput, @CurrentUser() user: UserType) {
    return this.chatApi.chat({
      ...data,
      requesterId: user.userId,
    });
  }
}
