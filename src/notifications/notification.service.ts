import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  NotificationChannel,
  NotificationData,
  NotificationType,
  ChannelType,
} from './interfaces';

export const NOTIFICATION_CHANNELS = 'NOTIFICATION_CHANNELS';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @Inject(NOTIFICATION_CHANNELS)
    private readonly channels: NotificationChannel[],
  ) {}

  async notify(
    channelTypes: ChannelType[],
    type: NotificationType,
    data: NotificationData,
  ): Promise<void> {
    this.logger.log(
      `Sending notification ${type} to user ${data.userId} via channels: ${channelTypes.join(', ')}`,
    );

    await Promise.allSettled(
      channelTypes.map(async (channelType) => {
        const strategy = this.channels.find((c) => c.supports(channelType));

        if (!strategy) {
          this.logger.warn(`No strategy found for channel: ${channelType}`);
          return;
        }

        try {
          await strategy.send(type, data);
        } catch (error) {
          this.logger.error(
            `Failed to send notification via ${channelType}: ${error}`,
          );
        }
      }),
    );
  }

  async notifyMultiple(
    channelTypes: ChannelType[],
    type: NotificationType,
    users: NotificationData[],
  ): Promise<void> {
    await Promise.allSettled(
      users.map((userData) => this.notify(channelTypes, type, userData)),
    );
  }
}
