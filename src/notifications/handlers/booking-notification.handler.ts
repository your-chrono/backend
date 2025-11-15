import { Injectable, Logger } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import {
  BookingCreatedEvent,
  BookingConfirmedEvent,
  BookingRejectedEvent,
  BookingCancelledEvent,
  BookingCompletedEvent,
  BookingReminderEvent,
} from '../events';
import { NotificationService } from '../notification.service';
import { ChannelType, NotificationType } from '../interfaces';

@Injectable()
@EventsHandler(BookingCreatedEvent)
export class BookingCreatedHandler
  implements IEventHandler<BookingCreatedEvent>
{
  private readonly logger = new Logger(BookingCreatedHandler.name);

  constructor(private readonly notificationService: NotificationService) {}

  async handle(event: BookingCreatedEvent): Promise<void> {
    this.logger.log(
      `Handling BookingCreatedEvent for booking ${event.bookingId}`,
    );

    await this.notificationService.notify(
      [ChannelType.EMAIL],
      NotificationType.BOOKING_CREATED,
      {
        userId: event.userId,
        title: 'Бронь создана',
        message: 'Ваша бронь создана. Ожидаем подтверждения эксперта.',
        metadata: {
          bookingId: event.bookingId,
          slotId: event.slotId,
          creditsLocked: event.creditsLocked,
          startTime: event.startTime.toISOString(),
          endTime: event.endTime.toISOString(),
        },
      },
    );

    await this.notificationService.notify(
      [ChannelType.EMAIL],
      NotificationType.BOOKING_CREATED,
      {
        userId: event.expertId,
        title: 'Новый запрос на бронирование',
        message: 'Новый запрос на бронирование вашего времени.',
        metadata: {
          bookingId: event.bookingId,
          slotId: event.slotId,
          userId: event.userId,
          creditsLocked: event.creditsLocked,
          startTime: event.startTime.toISOString(),
          endTime: event.endTime.toISOString(),
        },
      },
    );
  }
}

@Injectable()
@EventsHandler(BookingConfirmedEvent)
export class BookingConfirmedHandler
  implements IEventHandler<BookingConfirmedEvent>
{
  private readonly logger = new Logger(BookingConfirmedHandler.name);

  constructor(private readonly notificationService: NotificationService) {}

  async handle(event: BookingConfirmedEvent): Promise<void> {
    this.logger.log(
      `Handling BookingConfirmedEvent for booking ${event.bookingId}`,
    );

    await this.notificationService.notify(
      [ChannelType.EMAIL],
      NotificationType.BOOKING_CONFIRMED,
      {
        userId: event.userId,
        title: 'Бронь подтверждена!',
        message: 'Отлично! Ваша бронь подтверждена экспертом.',
        metadata: {
          bookingId: event.bookingId,
          slotId: event.slotId,
          expertId: event.expertId,
          startTime: event.startTime.toISOString(),
          endTime: event.endTime.toISOString(),
        },
      },
    );
  }
}

@Injectable()
@EventsHandler(BookingRejectedEvent)
export class BookingRejectedHandler
  implements IEventHandler<BookingRejectedEvent>
{
  private readonly logger = new Logger(BookingRejectedHandler.name);

  constructor(private readonly notificationService: NotificationService) {}

  async handle(event: BookingRejectedEvent): Promise<void> {
    this.logger.log(
      `Handling BookingRejectedEvent for booking ${event.bookingId}`,
    );

    await this.notificationService.notify(
      [ChannelType.EMAIL],
      NotificationType.BOOKING_REJECTED,
      {
        userId: event.userId,
        title: 'Бронь отклонена',
        message: event.reason
          ? `Ваша бронь отклонена. Причина: ${event.reason}. Кредиты возвращены.`
          : 'Ваша бронь отклонена. Кредиты возвращены.',
        metadata: {
          bookingId: event.bookingId,
          slotId: event.slotId,
          creditsRefunded: event.creditsRefunded,
          reason: event.reason,
        },
      },
    );
  }
}

@Injectable()
@EventsHandler(BookingCancelledEvent)
export class BookingCancelledHandler
  implements IEventHandler<BookingCancelledEvent>
{
  private readonly logger = new Logger(BookingCancelledHandler.name);

  constructor(private readonly notificationService: NotificationService) {}

  async handle(event: BookingCancelledEvent): Promise<void> {
    this.logger.log(
      `Handling BookingCancelledEvent for booking ${event.bookingId}`,
    );

    const cancelledByClient = event.cancelledBy === event.userId;

    await this.notificationService.notify(
      [ChannelType.EMAIL],
      NotificationType.BOOKING_CANCELLED,
      {
        userId: event.userId,
        title: 'Бронь отменена',
        message: cancelledByClient
          ? 'Ваша бронь отменена. Кредиты возвращены.'
          : 'Эксперт отменил бронь. Кредиты возвращены.',
        metadata: {
          bookingId: event.bookingId,
          slotId: event.slotId,
          cancelledBy: event.cancelledBy,
          creditsRefunded: event.creditsRefunded,
          reason: event.reason,
        },
      },
    );

    await this.notificationService.notify(
      [ChannelType.EMAIL],
      NotificationType.BOOKING_CANCELLED,
      {
        userId: event.expertId,
        title: 'Бронь отменена',
        message: cancelledByClient
          ? 'Клиент отменил бронирование.'
          : 'Вы отменили бронирование.',
        metadata: {
          bookingId: event.bookingId,
          slotId: event.slotId,
          cancelledBy: event.cancelledBy,
          reason: event.reason,
        },
      },
    );
  }
}

@Injectable()
@EventsHandler(BookingCompletedEvent)
export class BookingCompletedHandler
  implements IEventHandler<BookingCompletedEvent>
{
  private readonly logger = new Logger(BookingCompletedHandler.name);

  constructor(private readonly notificationService: NotificationService) {}

  async handle(event: BookingCompletedEvent): Promise<void> {
    this.logger.log(
      `Handling BookingCompletedEvent for booking ${event.bookingId}`,
    );

    await this.notificationService.notify(
      [ChannelType.EMAIL],
      NotificationType.BOOKING_COMPLETED,
      {
        userId: event.userId,
        title: 'Встреча завершена',
        message: 'Встреча завершена. Как все прошло?',
        metadata: {
          bookingId: event.bookingId,
          slotId: event.slotId,
          expertId: event.expertId,
          creditsReleased: event.creditsReleased,
          completedAt: event.completedAt.toISOString(),
        },
      },
    );

    await this.notificationService.notify(
      [ChannelType.EMAIL],
      NotificationType.BOOKING_COMPLETED,
      {
        userId: event.expertId,
        title: 'Встреча завершена',
        message: `Встреча завершена. Кредиты (${event.creditsReleased}) зачислены.`,
        metadata: {
          bookingId: event.bookingId,
          slotId: event.slotId,
          userId: event.userId,
          creditsReleased: event.creditsReleased,
          completedAt: event.completedAt.toISOString(),
        },
      },
    );
  }
}

@Injectable()
@EventsHandler(BookingReminderEvent)
export class BookingReminderHandler
  implements IEventHandler<BookingReminderEvent>
{
  private readonly logger = new Logger(BookingReminderHandler.name);

  constructor(private readonly notificationService: NotificationService) {}

  async handle(event: BookingReminderEvent): Promise<void> {
    this.logger.log(
      `Handling BookingReminderEvent for booking ${event.bookingId}`,
    );

    const message = `Напоминание: встреча через ${event.minutesUntilStart} минут`;

    await this.notificationService.notifyMultiple(
      [ChannelType.EMAIL],
      NotificationType.BOOKING_REMINDER,
      [
        {
          userId: event.userId,
          title: 'Напоминание о встрече',
          message,
          metadata: {
            bookingId: event.bookingId,
            slotId: event.slotId,
            startTime: event.startTime.toISOString(),
            minutesUntilStart: event.minutesUntilStart,
          },
        },
        {
          userId: event.expertId,
          title: 'Напоминание о встрече',
          message,
          metadata: {
            bookingId: event.bookingId,
            slotId: event.slotId,
            startTime: event.startTime.toISOString(),
            minutesUntilStart: event.minutesUntilStart,
          },
        },
      ],
    );
  }
}
