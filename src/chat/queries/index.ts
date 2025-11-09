import {
  GetChatHandler,
  GetChatMessagesHandler,
  GetMessageHandler,
  ResolveReplyMessageByMessageHandler,
} from './handlers';

export const CHAT_QUERIES = [
  GetChatHandler,
  GetChatMessagesHandler,
  GetMessageHandler,
  ResolveReplyMessageByMessageHandler,
];

export * from './impl';
