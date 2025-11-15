import { Injectable, Logger } from '@nestjs/common';
import {
  ChannelType,
  NotificationChannel,
  NotificationData,
  NotificationType,
} from '../interfaces';

@Injectable()
export class EmailChannelStrategy implements NotificationChannel {
  private readonly logger = new Logger(EmailChannelStrategy.name);

  // constructor(private readonly emailService: EmailService) {}

  supports(channelType: string): boolean {
    return channelType === ChannelType.EMAIL;
  }

  async send(type: NotificationType, data: NotificationData): Promise<void> {
    try {
      this.logger.log(
        `Sending email notification to user ${data.userId}: ${type}`,
      );

      // TODO: Implement email sending based on notification type
      switch (type) {
        case NotificationType.BOOKING_CREATED:
          this.logger.debug(`Email: Booking created - ${data.title}`);
          break;
        case NotificationType.BOOKING_CONFIRMED:
          this.logger.debug(`Email: Booking confirmed - ${data.title}`);
          break;
        case NotificationType.BOOKING_REJECTED:
          this.logger.debug(`Email: Booking rejected - ${data.title}`);
          break;
        case NotificationType.BOOKING_CANCELLED:
          this.logger.debug(`Email: Booking cancelled - ${data.title}`);
          break;
        case NotificationType.BOOKING_COMPLETED:
          this.logger.debug(`Email: Booking completed - ${data.title}`);
          break;
        case NotificationType.BOOKING_REMINDER:
          this.logger.debug(`Email: Booking reminder - ${data.title}`);
          break;

        case NotificationType.CREDITS_ADDED:
          this.logger.debug(`Email: Credits added - ${data.title}`);
          break;
        case NotificationType.CREDITS_WITHDRAWN:
          this.logger.debug(`Email: Credits withdrawn - ${data.title}`);
          break;
        case NotificationType.CREDITS_LOCKED:
          this.logger.debug(`Email: Credits locked - ${data.title}`);
          break;
        case NotificationType.CREDITS_RELEASED:
          this.logger.debug(`Email: Credits released - ${data.title}`);
          break;
        case NotificationType.CREDITS_REFUNDED:
          this.logger.debug(`Email: Credits refunded - ${data.title}`);
          break;
        case NotificationType.LOW_BALANCE:
          this.logger.debug(`Email: Low balance - ${data.title}`);
          break;

        default:
          this.logger.warn(`Unsupported email notification type: ${type}`);
      }

      this.logger.log(
        `Email notification sent successfully to user ${data.userId}`,
      );
    } catch (error) {
      this.logger.error(`Failed to send email notification: ${error}`);
    }
  }
}
