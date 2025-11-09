import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { DatabaseModule } from '../database';
import { ChatApiService } from './chat-api.service';
import { CHAT_COMMANDS } from './commands';
import { CHAT_QUERIES } from './queries';
import {
  MessageService,
  MessageValidationService,
  PaginatedMessagesService,
} from './services';

@Module({
  imports: [CqrsModule, DatabaseModule],
  providers: [
    ChatApiService,
    MessageService,
    MessageValidationService,
    PaginatedMessagesService,
    ...CHAT_COMMANDS,
    ...CHAT_QUERIES,
  ],
  exports: [ChatApiService],
})
export class ChatModule {}
