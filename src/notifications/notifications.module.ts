import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { DatabaseModule } from '../database';
import {
  NotificationService,
  NOTIFICATION_CHANNELS,
} from './notification.service';
import { NOTIFICATION_HANDLERS } from './handlers';
import { EmailChannelStrategy } from './channels';

@Module({
  imports: [CqrsModule, DatabaseModule],
  providers: [
    NotificationService,
    EmailChannelStrategy,
    ...NOTIFICATION_HANDLERS,
    {
      provide: NOTIFICATION_CHANNELS,
      useFactory: (email: EmailChannelStrategy) => [email],
      inject: [EmailChannelStrategy],
    },
  ],
  exports: [NotificationService],
})
export class NotificationsModule {}
