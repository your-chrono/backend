# Integration Guide - Как эмитить события в Booking и Wallet модулях

Этот документ содержит пошаговые инструкции по интеграции событий notifications в существующие handlers бронирований и кошелька.

## 1. Booking Module Integration

### 1.1. Импорт EventBus и событий

В каждом handler файле добавьте импорты:

```typescript
import { EventBus } from '@nestjs/cqrs';
import {
  BookingCreatedEvent,
  BookingConfirmedEvent,
  BookingRejectedEvent,
  BookingCancelledEvent,
  BookingCompletedEvent,
} from '../../notifications/events';
```

### 1.2. Инжект EventBus в конструктор

```typescript
export class YourBookingHandler {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventBus: EventBus, // Добавьте эту строку
  ) {}
}
```

### 1.3. CreateBookingHandler

**Файл**: `src/booking/commands/handlers/create-booking.handler.ts`

Добавьте после создания бронирования (строка ~92):

```typescript
// После успешного создания бронирования и блокировки кредитов
await this.lockBookingCredits({
  userId: data.userId,
  amount: slot.price,
  bookingId: booking.id,
});

// ДОБАВЬТЕ ЭТО:
// Emit BookingCreatedEvent
this.eventBus.publish(
  new BookingCreatedEvent(
    booking.id,
    data.userId,
    slot.expertId,
    slot.id,
    slot.price,
    slot.startTime,
    slot.endTime,
  ),
);

return { bookingId: booking.id };
```

### 1.4. ConfirmBookingHandler

**Файл**: `src/booking/commands/handlers/confirm-booking.handler.ts`

Добавьте после обновления статуса (строка ~60):

```typescript
await this.prisma.booking.update({
  where: { id: booking.id },
  data: { status: BookingStatus.CONFIRMED },
});

// ДОБАВЬТЕ ЭТО:
// Emit BookingConfirmedEvent
this.eventBus.publish(
  new BookingConfirmedEvent(
    booking.id,
    booking.userId,
    booking.slot.expertId,
    booking.slotId,
    booking.slot.startTime,
    booking.slot.endTime,
  ),
);

return { bookingId: booking.id };
```

### 1.5. CancelBookingHandler

**Файл**: `src/booking/commands/handlers/cancel-booking.handler.ts`

Добавьте после обновления статуса (строка ~71):

```typescript
await this.prisma.slot.update({
  where: { id: booking.slotId },
  data: { isBooked: false },
});

// ДОБАВЬТЕ ЭТО:
// Emit BookingCancelledEvent
this.eventBus.publish(
  new BookingCancelledEvent(
    booking.id,
    booking.userId,
    booking.slot.expertId,
    booking.slotId,
    data.requesterId, // кто отменил
    booking.creditsLocked,
    data.reason,
  ),
);

return { bookingId: booking.id };
```

**ВАЖНО**: Если бронь отклонена экспертом (не подтверждена), можно эмитить BookingRejectedEvent вместо BookingCancelledEvent:

```typescript
// В зависимости от логики, можно использовать:
if (booking.status === BookingStatus.PENDING && data.requesterId === booking.slot.expertId) {
  // Эксперт отклонил ожидающую бронь
  this.eventBus.publish(
    new BookingRejectedEvent(
      booking.id,
      booking.userId,
      booking.slot.expertId,
      booking.slotId,
      booking.creditsLocked,
      data.reason,
    ),
  );
} else {
  // Обычная отмена
  this.eventBus.publish(
    new BookingCancelledEvent(/* ... */),
  );
}
```

### 1.6. CompleteBookingHandler

**Файл**: `src/booking/commands/handlers/complete-booking.handler.ts`

Добавьте после обновления статуса (строка ~64):

```typescript
await this.prisma.slot.update({
  where: { id: booking.slotId },
  data: { isBooked: false },
});

// ДОБАВЬТЕ ЭТО:
// Emit BookingCompletedEvent
this.eventBus.publish(
  new BookingCompletedEvent(
    booking.id,
    booking.userId,
    booking.slot.expertId,
    booking.slotId,
    booking.creditsLocked, // сколько было списано
    new Date(),
  ),
);

return { bookingId: booking.id };
```

---

## 2. Wallet Module Integration

### 2.1. Импорт EventBus и событий

В каждом wallet handler файле добавьте:

```typescript
import { EventBus } from '@nestjs/cqrs';
import {
  CreditsAddedEvent,
  CreditsWithdrawnEvent,
  CreditsLockedEvent,
  CreditsReleasedEvent,
  CreditsRefundedEvent,
  LowBalanceEvent,
} from '../../notifications/events';
```

### 2.2. TopUpWalletHandler

**Файл**: `src/wallet/commands/handlers/top-up-wallet.handler.ts`

```typescript
// После создания транзакции и обновления баланса
const transaction = await this.prisma.transaction.create({
  data: {
    walletId: wallet.id,
    type: TransactionType.CREDIT,
    amount: data.amount,
    description: data.description,
  },
});

const updatedWallet = await this.prisma.wallet.update({
  where: { id: wallet.id },
  data: { balance: { increment: data.amount } },
  select: { id: true, balance: true, userId: true },
});

// ДОБАВЬТЕ ЭТО:
// Emit CreditsAddedEvent
this.eventBus.publish(
  new CreditsAddedEvent(
    updatedWallet.userId,
    updatedWallet.id,
    data.amount,
    updatedWallet.balance,
    transaction.id,
    data.description,
  ),
);

return updatedWallet;
```

### 2.3. WithdrawWalletHandler

**Файл**: `src/wallet/commands/handlers/withdraw-wallet.handler.ts`

```typescript
// После создания транзакции и обновления баланса
const transaction = await this.prisma.transaction.create({
  data: {
    walletId: wallet.id,
    type: TransactionType.DEBIT,
    amount: data.amount,
    description: data.description,
  },
});

const updatedWallet = await this.prisma.wallet.update({
  where: { id: wallet.id },
  data: { balance: { decrement: data.amount } },
  select: { id: true, balance: true, userId: true },
});

// ДОБАВЬТЕ ЭТО:
// Emit CreditsWithdrawnEvent
this.eventBus.publish(
  new CreditsWithdrawnEvent(
    updatedWallet.userId,
    updatedWallet.id,
    data.amount,
    updatedWallet.balance,
    transaction.id,
    data.description,
  ),
);

return updatedWallet;
```

### 2.4. В BaseBookingHandler (или WalletLedgerService)

**Для метода lockBookingCredits:**

```typescript
// После блокировки кредитов
const transaction = await this.prisma.transaction.create({
  data: {
    walletId: wallet.id,
    type: TransactionType.ESCROW_LOCK,
    amount: -amount, // отрицательное значение
    relatedBookingId: bookingId,
  },
});

const updatedWallet = await this.prisma.wallet.update({
  where: { id: wallet.id },
  data: { balance: { decrement: amount } },
  select: { id: true, balance: true, userId: true },
});

// ДОБАВЬТЕ ЭТО:
// Emit CreditsLockedEvent
this.eventBus.publish(
  new CreditsLockedEvent(
    userId,
    wallet.id,
    amount,
    bookingId,
    transaction.id,
    updatedWallet.balance,
  ),
);
```

**Для метода releaseBookingCredits:**

```typescript
// После релиза кредитов эксперту
const transaction = await this.prisma.transaction.create({
  data: {
    walletId: expertWallet.id,
    type: TransactionType.ESCROW_RELEASE,
    amount: amount,
    relatedBookingId: bookingId,
  },
});

const updatedWallet = await this.prisma.wallet.update({
  where: { id: expertWallet.id },
  data: { balance: { increment: amount } },
  select: { id: true, balance: true, userId: true },
});

// ДОБАВЬТЕ ЭТО:
// Emit CreditsReleasedEvent
this.eventBus.publish(
  new CreditsReleasedEvent(
    expertId,
    expertWallet.id,
    amount,
    bookingId,
    transaction.id,
    updatedWallet.balance,
  ),
);
```

**Для метода refundBookingCredits:**

```typescript
// После возврата кредитов
const transaction = await this.prisma.transaction.create({
  data: {
    walletId: wallet.id,
    type: TransactionType.REFUND,
    amount: amount,
    relatedBookingId: bookingId,
    description: description,
  },
});

const updatedWallet = await this.prisma.wallet.update({
  where: { id: wallet.id },
  data: { balance: { increment: amount } },
  select: { id: true, balance: true, userId: true },
});

// ДОБАВЬТЕ ЭТО:
// Emit CreditsRefundedEvent
this.eventBus.publish(
  new CreditsRefundedEvent(
    userId,
    wallet.id,
    amount,
    bookingId,
    transaction.id,
    updatedWallet.balance,
    description,
  ),
);
```

### 2.5. Low Balance Check

Добавьте проверку баланса в `CreateBookingHandler` перед бронированием:

```typescript
const LOW_BALANCE_THRESHOLD = 100; // минимальный баланс

this.ensureSufficientBalance(wallet.balance, slot.price);

// ДОБАВЬТЕ ЭТО:
// Check if balance will be low after booking
if (wallet.balance - slot.price < LOW_BALANCE_THRESHOLD) {
  this.eventBus.publish(
    new LowBalanceEvent(
      data.userId,
      wallet.id,
      wallet.balance - slot.price,
      LOW_BALANCE_THRESHOLD,
    ),
  );
}
```

---

## 3. BookingReminder (Cron Job)

Создайте отдельный сервис для напоминаний:

**Файл**: `src/booking/services/booking-reminder.service.ts`

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EventBus } from '@nestjs/cqrs';
import { PrismaService } from '../../database';
import { BookingStatus } from '@prisma/client';
import { BookingReminderEvent } from '../../notifications/events';

@Injectable()
export class BookingReminderService {
  private readonly logger = new Logger(BookingReminderService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventBus: EventBus,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async sendBookingReminders(): Promise<void> {
    this.logger.log('Checking for upcoming bookings...');

    const now = new Date();
    const reminderTime = new Date(now.getTime() + 30 * 60 * 1000); // +30 минут
    const windowStart = new Date(now.getTime() + 25 * 60 * 1000); // +25 минут
    const windowEnd = new Date(now.getTime() + 35 * 60 * 1000); // +35 минут

    const upcomingBookings = await this.prisma.booking.findMany({
      where: {
        status: BookingStatus.CONFIRMED,
        slot: {
          startTime: {
            gte: windowStart,
            lte: windowEnd,
          },
        },
      },
      include: {
        slot: {
          select: {
            id: true,
            expertId: true,
            startTime: true,
          },
        },
      },
    });

    this.logger.log(`Found ${upcomingBookings.length} bookings for reminder`);

    for (const booking of upcomingBookings) {
      const minutesUntilStart = Math.round(
        (booking.slot.startTime.getTime() - now.getTime()) / 1000 / 60,
      );

      this.eventBus.publish(
        new BookingReminderEvent(
          booking.id,
          booking.userId,
          booking.slot.expertId,
          booking.slotId,
          booking.slot.startTime,
          minutesUntilStart,
        ),
      );

      this.logger.log(
        `Reminder sent for booking ${booking.id} (${minutesUntilStart} minutes)`,
      );
    }
  }
}
```

**Регистрация сервиса** в `BookingModule`:

```typescript
import { BookingReminderService } from './services/booking-reminder.service';

@Module({
  imports: [CqrsModule, DatabaseModule, WalletModule],
  providers: [
    BookingApiService,
    BookingReminderService, // Добавьте эту строку
    ...BOOKING_COMMANDS,
    ...BOOKING_QUERIES,
  ],
  exports: [BookingApiService],
})
export class BookingModule {}
```

---

## 4. Проверка работы

### 4.1. Проверьте логи

После интеграции, при создании бронирования вы должны увидеть в логах:

```
[BookingCreatedHandler] Handling BookingCreatedEvent for booking xxx
[NotificationService] Notification created for user yyy: booking.created
```

### 4.2. Тестирование через GraphQL

```graphql
mutation {
  createMyBooking(data: { slotId: "slot-id" }) {
    id
  }
}
```

Проверьте логи на наличие:
- `BookingCreatedEvent`
- Два уведомления (для клиента и эксперта)

### 4.3. Отладка

Если события не эмитятся:
1. Проверьте, что `NotificationsModule` импортирован в `AppModule`
2. Проверьте, что `EventBus` инжектирован в handlers
3. Проверьте логи на ошибки

---

## 5. Summary - Что нужно обновить

### Booking Handlers:
- [ ] `CreateBookingHandler` → добавить `BookingCreatedEvent`
- [ ] `ConfirmBookingHandler` → добавить `BookingConfirmedEvent`
- [ ] `CancelBookingHandler` → добавить `BookingCancelledEvent` или `BookingRejectedEvent`
- [ ] `CompleteBookingHandler` → добавить `BookingCompletedEvent`
- [ ] Создать `BookingReminderService` с cron job

### Wallet Handlers:
- [ ] `TopUpWalletHandler` → добавить `CreditsAddedEvent`
- [ ] `WithdrawWalletHandler` → добавить `CreditsWithdrawnEvent`
- [ ] `BaseBookingHandler.lockBookingCredits()` → добавить `CreditsLockedEvent`
- [ ] `BaseBookingHandler.releaseBookingCredits()` → добавить `CreditsReleasedEvent`
- [ ] `BaseBookingHandler.refundBookingCredits()` → добавить `CreditsRefundedEvent`
- [ ] `CreateBookingHandler` → добавить проверку и `LowBalanceEvent`

### Database:
- [ ] Добавить `Notification` model в `prisma/schema.prisma`
- [ ] Выполнить миграцию: `npx prisma migrate dev --name add_notification_model`
- [ ] Раскомментировать код сохранения в БД в `NotificationService`

### Future:
- [ ] Создать GraphQL API для получения уведомлений
- [ ] Добавить Email провайдер для отправки email
- [ ] Добавить WebSocket subscriptions для real-time уведомлений

---

Готово! После выполнения всех шагов, система уведомлений будет работать и логировать все события.
