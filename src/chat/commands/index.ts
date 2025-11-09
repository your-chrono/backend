import {
  CreateMessageHandler,
  UpdateMessageHandler,
  DeleteMessageHandler,
} from './handlers';

export const CHAT_COMMANDS = [
  CreateMessageHandler,
  UpdateMessageHandler,
  DeleteMessageHandler,
];

export * from './impl';
