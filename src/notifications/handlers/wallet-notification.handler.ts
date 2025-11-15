import { Injectable, Logger } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import {
  CreditsAddedEvent,
  CreditsWithdrawnEvent,
  CreditsLockedEvent,
  CreditsReleasedEvent,
  CreditsRefundedEvent,
  LowBalanceEvent,
} from '../events';
import { NotificationService } from '../notification.service';
import { ChannelType, NotificationType } from '../interfaces';

@Injectable()
@EventsHandler(CreditsAddedEvent)
export class CreditsAddedHandler implements IEventHandler<CreditsAddedEvent> {
  private readonly logger = new Logger(CreditsAddedHandler.name);

  constructor(private readonly notificationService: NotificationService) {}

  async handle(event: CreditsAddedEvent): Promise<void> {
    this.logger.log(`Handling CreditsAddedEvent for user ${event.userId}`);

    await this.notificationService.notify(
      [ChannelType.EMAIL],
      NotificationType.CREDITS_ADDED,
      {
        userId: event.userId,
        title: 'Баланс пополнен',
        message: `Ваш баланс пополнен на ${event.amount} кредитов. Новый баланс: ${event.newBalance}`,
        metadata: {
          walletId: event.walletId,
          amount: event.amount,
          newBalance: event.newBalance,
          transactionId: event.transactionId,
          description: event.description,
        },
      },
    );
  }
}

@Injectable()
@EventsHandler(CreditsWithdrawnEvent)
export class CreditsWithdrawnHandler
  implements IEventHandler<CreditsWithdrawnEvent>
{
  private readonly logger = new Logger(CreditsWithdrawnHandler.name);

  constructor(private readonly notificationService: NotificationService) {}

  async handle(event: CreditsWithdrawnEvent): Promise<void> {
    this.logger.log(`Handling CreditsWithdrawnEvent for user ${event.userId}`);

    await this.notificationService.notify(
      [ChannelType.EMAIL],
      NotificationType.CREDITS_WITHDRAWN,
      {
        userId: event.userId,
        title: 'Средства выведены',
        message: `Выведено ${event.amount} кредитов. Новый баланс: ${event.newBalance}`,
        metadata: {
          walletId: event.walletId,
          amount: event.amount,
          newBalance: event.newBalance,
          transactionId: event.transactionId,
          description: event.description,
        },
      },
    );
  }
}

@Injectable()
@EventsHandler(CreditsLockedEvent)
export class CreditsLockedHandler implements IEventHandler<CreditsLockedEvent> {
  private readonly logger = new Logger(CreditsLockedHandler.name);

  constructor(private readonly notificationService: NotificationService) {}

  async handle(event: CreditsLockedEvent): Promise<void> {
    this.logger.log(`Handling CreditsLockedEvent for user ${event.userId}`);

    await this.notificationService.notify(
      [ChannelType.EMAIL],
      NotificationType.CREDITS_LOCKED,
      {
        userId: event.userId,
        title: 'Кредиты заблокированы',
        message: `Заблокировано ${event.amount} кредитов для бронирования. Доступно: ${event.newBalance}`,
        metadata: {
          walletId: event.walletId,
          amount: event.amount,
          newBalance: event.newBalance,
          bookingId: event.bookingId,
          transactionId: event.transactionId,
        },
      },
    );
  }
}

@Injectable()
@EventsHandler(CreditsReleasedEvent)
export class CreditsReleasedHandler
  implements IEventHandler<CreditsReleasedEvent>
{
  private readonly logger = new Logger(CreditsReleasedHandler.name);

  constructor(private readonly notificationService: NotificationService) {}

  async handle(event: CreditsReleasedEvent): Promise<void> {
    this.logger.log(
      `Handling CreditsReleasedEvent for expert ${event.expertId}`,
    );

    await this.notificationService.notify(
      [ChannelType.EMAIL],
      NotificationType.CREDITS_RELEASED,
      {
        userId: event.expertId,
        title: 'Кредиты получены',
        message: `Получено ${event.amount} кредитов за завершенную встречу. Новый баланс: ${event.newBalance}`,
        metadata: {
          walletId: event.walletId,
          amount: event.amount,
          newBalance: event.newBalance,
          bookingId: event.bookingId,
          transactionId: event.transactionId,
        },
      },
    );
  }
}

@Injectable()
@EventsHandler(CreditsRefundedEvent)
export class CreditsRefundedHandler
  implements IEventHandler<CreditsRefundedEvent>
{
  private readonly logger = new Logger(CreditsRefundedHandler.name);

  constructor(private readonly notificationService: NotificationService) {}

  async handle(event: CreditsRefundedEvent): Promise<void> {
    this.logger.log(`Handling CreditsRefundedEvent for user ${event.userId}`);

    await this.notificationService.notify(
      [ChannelType.EMAIL],
      NotificationType.CREDITS_REFUNDED,
      {
        userId: event.userId,
        title: 'Кредиты возвращены',
        message: event.reason
          ? `Возвращено ${event.amount} кредитов. Причина: ${event.reason}. Новый баланс: ${event.newBalance}`
          : `Возвращено ${event.amount} кредитов. Новый баланс: ${event.newBalance}`,
        metadata: {
          walletId: event.walletId,
          amount: event.amount,
          newBalance: event.newBalance,
          bookingId: event.bookingId,
          transactionId: event.transactionId,
          reason: event.reason,
        },
      },
    );
  }
}

@Injectable()
@EventsHandler(LowBalanceEvent)
export class LowBalanceHandler implements IEventHandler<LowBalanceEvent> {
  private readonly logger = new Logger(LowBalanceHandler.name);

  constructor(private readonly notificationService: NotificationService) {}

  async handle(event: LowBalanceEvent): Promise<void> {
    this.logger.log(`Handling LowBalanceEvent for user ${event.userId}`);

    await this.notificationService.notify(
      [ChannelType.EMAIL],
      NotificationType.LOW_BALANCE,
      {
        userId: event.userId,
        title: 'Низкий баланс',
        message: `Ваш баланс (${event.currentBalance} кредитов) ниже минимального. Пополните баланс для бронирования.`,
        metadata: {
          walletId: event.walletId,
          currentBalance: event.currentBalance,
          threshold: event.threshold,
        },
      },
    );
  }
}
