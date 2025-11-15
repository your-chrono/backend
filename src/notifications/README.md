# Notifications Module (Refactored)

Модуль уведомлений для обработки событий из модулей Booking и Wallet с использованием **Strategy Pattern** по примеру f2b-backend.

## 🏗️ Архитектура

Модуль использует **Event-Driven Architecture** + **Strategy Pattern** + **CQRS**:

1. **События (Events)** - определяют что произошло в системе
2. **Event Handlers** - слушают события и отправляют уведомления через сервис
3. **NotificationService** - роутер, выбирает канал доставки
4. **Channels (Strategies)** - реализации доставки (IN_APP, EMAIL, PUSH, SMS)

### Паттерн Strategy

```typescript
// NotificationChannel interface
interface NotificationChannel {
  supports(channelType: string): boolean;
  send(type: NotificationType, data: NotificationData): Promise<void>;
}

// Implementations
- InAppChannelStrategy → сохраняет в БД
- EmailChannelStrategy → отправляет email
- PushChannelStrategy → отправляет push (будущее)
- SmsChannelStrategy → отправляет SMS (будущее)
```

## 📁 Структура модуля

```
src/notifications/
├── channels/                          # ✨ NEW: Strategy Pattern
│   ├── in-app-channel.strategy.ts     # Сохранение в БД (Prisma)
│   ├── email-channel.strategy.ts      # Отправка email (TODO)
│   └── index.ts
├── events/
│   └── impl/
│       ├── booking/                    # События бронирования (6)
│       │   ├── booking-created.event.ts
│       │   ├── booking-confirmed.event.ts
│       │   ├── booking-rejected.event.ts
│       │   ├── booking-cancelled.event.ts
│       │   ├── booking-completed.event.ts
│       │   └── booking-reminder.event.ts
│       └── wallet/                     # События кошелька (6)
│           ├── credits-added.event.ts
│           ├── credits-withdrawn.event.ts
│           ├── credits-locked.event.ts
│           ├── credits-released.event.ts
│           ├── credits-refunded.event.ts
│           └── low-balance.event.ts
├── handlers/                           # ✨ UPDATED: используют notify()
│   ├── booking-notification.handler.ts (6 handlers)
│   ├── wallet-notification.handler.ts  (6 handlers)
│   └── index.ts
├── notification.service.ts             # ✨ UPDATED: роутер к каналам
├── interfaces.ts                       # ✨ NEW: NotificationChannel, enums
├── notifications.module.ts             # ✨ UPDATED: DI для каналов
├── index.ts
├── README.md
├── INTEGRATION_GUIDE.md
├── PRISMA_SCHEMA.md
└── ARCHITECTURE_COMPARISON.md
```

## 🎯 Основные компоненты

### 1. NotificationService (роутер)

```typescript
class NotificationService {
  async notify(
    channelTypes: ChannelType[],    // [IN_APP, EMAIL]
    type: NotificationType,          // BOOKING_CREATED
    data: NotificationData,          // { userId, title, message, metadata }
  ): Promise<void>

  async notifyMultiple(
    channelTypes: ChannelType[],
    type: NotificationType,
    users: NotificationData[],
  ): Promise<void>
}
```

### 2. Channels (Strategies)

#### InAppChannelStrategy
- Сохраняет уведомления в БД для in-app отображения
- Использует Prisma для работы с Notification model

#### EmailChannelStrategy
- Отправляет email через EmailService (TODO)
- Switch по NotificationType для разных шаблонов

### 3. Event Handlers

```typescript
@EventsHandler(BookingCreatedEvent)
export class BookingCreatedHandler {
  constructor(private readonly notificationService: NotificationService) {}

  async handle(event: BookingCreatedEvent) {
    // Отправка через несколько каналов
    await this.notificationService.notify(
      [ChannelType.IN_APP, ChannelType.EMAIL],
      NotificationType.BOOKING_CREATED,
      {
        userId: event.userId,
        title: 'Бронь создана',
        message: '...',
        metadata: { bookingId: event.bookingId, ... },
      },
    );
  }
}
```

### 4. Interfaces

```typescript
enum ChannelType {
  IN_APP = 'IN_APP',    // Сохранение в БД
  EMAIL = 'EMAIL',       // Email отправка
  PUSH = 'PUSH',         // Push notifications
  SMS = 'SMS',           // SMS
}

enum NotificationType {
  BOOKING_CREATED = 'booking.created',
  BOOKING_CONFIRMED = 'booking.confirmed',
  // ... другие типы
}

interface NotificationData {
  userId: string;
  title: string;
  message: string;
  metadata?: Record<string, any>;
}
```

## 📊 События

### Booking Events (6 событий):
1. **BookingCreatedEvent** - Бронь создана
   - Получатели: Клиент + Эксперт
   - Каналы: IN_APP + EMAIL

2. **BookingConfirmedEvent** - Бронь подтверждена
   - Получатель: Клиент
   - Каналы: IN_APP + EMAIL

3. **BookingRejectedEvent** - Бронь отклонена
   - Получатель: Клиент
   - Каналы: IN_APP + EMAIL

4. **BookingCancelledEvent** - Бронь отменена
   - Получатели: Клиент + Эксперт
   - Каналы: IN_APP + EMAIL

5. **BookingCompletedEvent** - Встреча завершена
   - Получатели: Клиент + Эксперт
   - Каналы: IN_APP + EMAIL

6. **BookingReminderEvent** - Напоминание о встрече
   - Получатели: Клиент + Эксперт
   - Каналы: IN_APP + EMAIL

### Wallet Events (6 событий):
1. **CreditsAddedEvent** - Кредиты добавлены
2. **CreditsWithdrawnEvent** - Кредиты выведены
3. **CreditsLockedEvent** - Кредиты заблокированы (только IN_APP)
4. **CreditsReleasedEvent** - Кредиты переданы эксперту
5. **CreditsRefundedEvent** - Кредиты возвращены
6. **LowBalanceEvent** - Низкий баланс

## 🚀 Использование

### Пример отправки уведомления

```typescript
// В Event Handler
await this.notificationService.notify(
  [ChannelType.IN_APP, ChannelType.EMAIL],  // Каналы
  NotificationType.BOOKING_CREATED,          // Тип
  {
    userId: 'user-id',
    title: 'Бронь создана',
    message: 'Ваша бронь создана...',
    metadata: {
      bookingId: 'booking-id',
      slotId: 'slot-id',
      // ... дополнительные данные
    },
  },
);
```

### Отправка нескольким пользователям

```typescript
await this.notificationService.notifyMultiple(
  [ChannelType.IN_APP, ChannelType.EMAIL],
  NotificationType.BOOKING_REMINDER,
  [
    { userId: 'user-1', title: '...', message: '...', metadata: {} },
    { userId: 'user-2', title: '...', message: '...', metadata: {} },
  ],
);
```

## ✨ Преимущества нового подхода

### По сравнению с предыдущей реализацией:

1. **Strategy Pattern** ✅
   - Легко добавлять новые каналы (PUSH, SMS)
   - Каждый канал изолирован
   - Тестируемость

2. **Гибкость** ✅
   - Одновременная отправка через несколько каналов
   - Независимость каналов (если email упал, IN_APP продолжает работать)

3. **Расширяемость** ✅
   - Новый канал = новая strategy класс
   - Не нужно трогать существующий код

4. **Сохранены преимущества** ✅
   - Детализированные Event классы
   - Metadata для контекста
   - NotificationType с префиксами

## 🔧 Dependency Injection

```typescript
@Module({
  imports: [CqrsModule, DatabaseModule],
  providers: [
    NotificationService,
    InAppChannelStrategy,
    EmailChannelStrategy,
    ...NOTIFICATION_HANDLERS,
    {
      provide: NOTIFICATION_CHANNELS,
      useFactory: (inApp, email) => [inApp, email],
      inject: [InAppChannelStrategy, EmailChannelStrategy],
    },
  ],
  exports: [NotificationService],
})
export class NotificationsModule {}
```

## 📝 TODO: Следующие шаги

1. **Добавить Notification модель в Prisma** ✅ См. PRISMA_SCHEMA.md
2. **Раскомментировать код в InAppChannelStrategy** после миграции
3. **Добавить EmailService** и раскомментировать в EmailChannelStrategy
4. **Эмитить события в Booking/Wallet handlers** ✅ См. INTEGRATION_GUIDE.md
5. **Добавить PushChannelStrategy** (Firebase Cloud Messaging)
6. **Добавить SmsChannelStrategy** (Twilio)
7. **Создать GraphQL API** для получения уведомлений
8. **Добавить BookingReminderService** с cron job

## 📚 Документация

- **README.md** (этот файл) - общее описание
- **INTEGRATION_GUIDE.md** - как интегрировать с Booking/Wallet
- **PRISMA_SCHEMA.md** - схема БД для уведомлений
- **ARCHITECTURE_COMPARISON.md** - сравнение с f2b-backend

## 🎨 Архитектурная диаграмма

```
┌─────────────────┐
│  Booking Module │
│  Wallet Module  │
└────────┬────────┘
         │ emits events
         ▼
┌─────────────────────────────────┐
│     Event Handlers (12)         │
│  - BookingCreatedHandler        │
│  - CreditsAddedHandler          │
│  - ...                          │
└────────┬────────────────────────┘
         │ calls notify()
         ▼
┌─────────────────────────────────┐
│    NotificationService          │
│    (Router)                     │
└────────┬────────────────────────┘
         │ routes to channels
         ▼
┌────────┴────────┬───────────────┬──────────┐
│  IN_APP Channel │ EMAIL Channel │   PUSH   │
│  (Prisma)       │ (Email)       │ (Future) │
└─────────────────┴───────────────┴──────────┘
```

## 💡 Принципы

1. **Single Responsibility** - каждый канал отвечает за свою доставку
2. **Open/Closed** - открыт для расширения (новые каналы), закрыт для изменения
3. **Dependency Inversion** - зависимость от абстракции (NotificationChannel)
4. **Graceful Degradation** - падение одного канала не влияет на другие
5. **Event-Driven** - слабая связанность между модулями

---

**Версия**: 2.0 (Refactored with Strategy Pattern)
**Дата**: 15.11.2025
**Автор**: Based on f2b-backend architecture
