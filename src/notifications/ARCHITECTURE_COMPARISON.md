# Сравнение архитектуры Notifications Module

## F2B-Backend Approach vs Current Implementation

### 📋 F2B-Backend Architecture

#### Ключевые особенности:

1. **Strategy Pattern для каналов**
   - `NotificationChannel` interface
   - Разные стратегии: `EmailChannelStrategy`, потенциально `SmsChannelStrategy`, `PushChannelStrategy`
   - NotificationService выбирает стратегию по `channelType`

2. **NotificationService как роутер**
   ```typescript
   async notify(channelType: string, data: any) {
     const strategy = this.channels.find((c) => c.supports(channelType));
     await strategy.send(data);
   }
   ```

3. **Простые Event классы**
   ```typescript
   export class SignUpEvent {
     constructor(public readonly data: { readonly userId: string }) {}
   }
   ```

4. **Event Handlers вызывают NotificationService**
   ```typescript
   async handle({ data }: SignUpEvent) {
     await this.notificationService.notify(ChannelType.EMAIL, {
       type: EventType.SIGN_UP,
       payload: { userId: data.userId },
     });
   }
   ```

5. **Enums для типов**
   - `EventType` - типы событий (SIGN_UP, CONFIRM_EMAIL, и т.д.)
   - `ChannelType` - каналы доставки (EMAIL, SMS, PUSH)

6. **Dependency Injection для каналов**
   ```typescript
   {
     provide: NOTIFICATION_CHANNELS,
     useFactory: (email: EmailChannelStrategy) => [email],
     inject: [EmailChannelStrategy],
   }
   ```

#### Структура F2B:
```
notifications/
├── channels/
│   └── email-channel.strategy.ts    # EmailChannelStrategy
├── events/
│   ├── impl/                         # События
│   │   ├── sign-up.event.ts
│   │   ├── back-in-stock.event.ts
│   │   └── ...
│   └── handlers/                     # Обработчики
│       ├── sign-up.handler.ts
│       ├── back-in-stock.handler.ts
│       └── ...
├── notification.service.ts           # Роутер
├── notifications.module.ts
└── interfaces.ts                     # NotificationChannel, EventType, ChannelType
```

---

### 📋 Current Implementation (Chrono)

#### Ключевые особенности:

1. **Прямое создание уведомлений**
   - NotificationService.createNotification() напрямую
   - Нет паттерна Strategy

2. **Детализированные Event классы**
   ```typescript
   export class BookingCreatedEvent {
     constructor(
       public readonly bookingId: string,
       public readonly userId: string,
       public readonly expertId: string,
       // ... много полей
     ) {}
   }
   ```

3. **Event Handlers создают уведомления напрямую**
   ```typescript
   async handle(event: BookingCreatedEvent): Promise<void> {
     await this.notificationService.createNotification({
       userId: event.userId,
       type: NotificationType.BOOKING_CREATED,
       title: 'Бронь создана',
       message: 'Ваша бронь создана...',
       metadata: { ... },
     });
   }
   ```

4. **NotificationType enum** вместо EventType + ChannelType

5. **Хранение в БД** (планируется)
   - Notification model в Prisma
   - Сохранение всех уведомлений для in-app отображения

#### Структура Current:
```
notifications/
├── events/
│   └── impl/
│       ├── booking/                  # События бронирования
│       └── wallet/                   # События кошелька
├── handlers/
│   ├── booking-notification.handler.ts
│   └── wallet-notification.handler.ts
├── services/
│   └── notification.service.ts       # Создание уведомлений
└── notifications.module.ts
```

---

## 🔄 Comparison Table

| Аспект | F2B-Backend | Chrono (Current) | Рекомендация |
|--------|-------------|------------------|--------------|
| **Паттерн каналов** | Strategy Pattern | Нет паттерна | ✅ Добавить Strategy |
| **NotificationService** | Роутер к каналам | Создание уведомлений | ⚠️ Оставить как есть |
| **Event классы** | Простые (data object) | Детализированные | ✅ Оставить детализированные |
| **Типы событий** | EventType enum | NotificationType enum | ✅ Оставить NotificationType |
| **Каналы** | EMAIL (через strategy) | Нет (только логи) | ✅ Добавить channels |
| **Хранение в БД** | Нет | Планируется (Prisma) | ✅ Уникальное преимущество |
| **Email интеграция** | EmailApiService | Нет (TODO) | ✅ Добавить |
| **Metadata** | Нет | Есть (для deep links) | ✅ Преимущество |
| **Handlers** | Вызывают notify() | Создают напрямую | ⚠️ Можно улучшить |

---

## 🎯 Рекомендации по улучшению

### 1. Добавить Strategy Pattern для каналов ✅ ВЫСОКИЙ ПРИОРИТЕТ

**Преимущества:**
- Легко добавлять новые каналы (Email, SMS, Push)
- Разделение ответственности
- Тестируемость

**Реализация:**
```typescript
// interfaces.ts
export interface NotificationChannel {
  supports(channelType: string): boolean;
  send(type: NotificationType, data: any): Promise<void>;
}

export enum ChannelType {
  EMAIL = 'EMAIL',
  IN_APP = 'IN_APP',
  PUSH = 'PUSH',
  SMS = 'SMS',
}

// channels/in-app-channel.strategy.ts
@Injectable()
export class InAppChannelStrategy implements NotificationChannel {
  constructor(private readonly prisma: PrismaService) {}

  supports(channelType: string): boolean {
    return channelType === ChannelType.IN_APP;
  }

  async send(type: NotificationType, data: any): Promise<void> {
    await this.prisma.notification.create({
      data: {
        userId: data.userId,
        type: type,
        title: data.title,
        message: data.message,
        metadata: data.metadata || {},
        isRead: false,
      },
    });
  }
}

// channels/email-channel.strategy.ts
@Injectable()
export class EmailChannelStrategy implements NotificationChannel {
  constructor(private readonly emailService: EmailService) {}

  supports(channelType: string): boolean {
    return channelType === ChannelType.EMAIL;
  }

  async send(type: NotificationType, data: any): Promise<void> {
    switch (type) {
      case NotificationType.BOOKING_CREATED:
        await this.emailService.sendBookingCreated(data);
        break;
      case NotificationType.CREDITS_ADDED:
        await this.emailService.sendCreditsAdded(data);
        break;
      // ...
    }
  }
}
```

### 2. Обновить NotificationService как роутер ⚠️ СРЕДНИЙ ПРИОРИТЕТ

```typescript
@Injectable()
export class NotificationService {
  constructor(
    @Inject(NOTIFICATION_CHANNELS)
    private readonly channels: NotificationChannel[],
  ) {}

  async notify(
    channelTypes: ChannelType[],
    notificationType: NotificationType,
    data: any,
  ): Promise<void> {
    await Promise.all(
      channelTypes.map(async (channelType) => {
        const strategy = this.channels.find((c) => c.supports(channelType));
        if (!strategy) {
          this.logger.warn(`No strategy for channel: ${channelType}`);
          return;
        }
        await strategy.send(notificationType, data);
      }),
    );
  }
}
```

### 3. Обновить Event Handlers ⚠️ СРЕДНИЙ ПРИОРИТЕТ

```typescript
@EventsHandler(BookingCreatedEvent)
export class BookingCreatedHandler implements IEventHandler<BookingCreatedEvent> {
  constructor(private readonly notificationService: NotificationService) {}

  async handle(event: BookingCreatedEvent): Promise<void> {
    // Notify client via IN_APP and EMAIL
    await this.notificationService.notify(
      [ChannelType.IN_APP, ChannelType.EMAIL],
      NotificationType.BOOKING_CREATED,
      {
        userId: event.userId,
        title: 'Бронь создана',
        message: 'Ваша бронь создана...',
        metadata: { bookingId: event.bookingId, ... },
      },
    );

    // Notify expert via IN_APP and EMAIL
    await this.notificationService.notify(
      [ChannelType.IN_APP, ChannelType.EMAIL],
      NotificationType.BOOKING_CREATED,
      {
        userId: event.expertId,
        title: 'Новый запрос на бронирование',
        message: 'Новый запрос...',
        metadata: { bookingId: event.bookingId, ... },
      },
    );
  }
}
```

### 4. Сохранить преимущества текущей реализации ✅

**Что НЕ нужно менять:**
- Детализированные Event классы - удобнее для типизации
- NotificationType с префиксами (booking.*, wallet.*) - понятнее
- Metadata для deep links и контекста - важно для мобильных приложений
- Планы по хранению в БД - уникальное преимущество

---

## 📊 Итоговая рекомендуемая архитектура

```
notifications/
├── channels/                          # NEW: Strategy Pattern
│   ├── in-app-channel.strategy.ts     # Сохранение в БД
│   ├── email-channel.strategy.ts      # Отправка email (TODO)
│   └── index.ts
├── events/
│   └── impl/
│       ├── booking/                    # KEEP: Детализированные события
│       └── wallet/
├── handlers/                           # UPDATE: Использовать notify()
│   ├── booking-notification.handler.ts
│   └── wallet-notification.handler.ts
├── services/
│   └── notification.service.ts         # UPDATE: Роутер к каналам
├── interfaces.ts                       # NEW: NotificationChannel, ChannelType
└── notifications.module.ts             # UPDATE: DI для каналов
```

---

## 🚀 План миграции

### Phase 1: Добавить инфраструктуру (без breaking changes)
- [ ] Создать `interfaces.ts` с NotificationChannel и ChannelType
- [ ] Создать `channels/in-app-channel.strategy.ts`
- [ ] Обновить NotificationService (сохранить старый метод)
- [ ] Обновить NotificationsModule с DI

### Phase 2: Добавить Email канал
- [ ] Создать `channels/email-channel.strategy.ts`
- [ ] Интегрировать с Email сервисом (SendGrid/AWS SES)
- [ ] Добавить email templates

### Phase 3: Обновить Handlers
- [ ] Обновить BookingNotificationHandlers использовать notify()
- [ ] Обновить WalletNotificationHandlers использовать notify()
- [ ] Удалить старый метод createNotification()

### Phase 4: Расширение
- [ ] Добавить Push channel (Firebase)
- [ ] Добавить SMS channel (Twilio)
- [ ] Добавить настройки предпочтений пользователя

---

## 💡 Выводы

**Что взять из F2B-Backend:**
1. ✅ Strategy Pattern для каналов - гибкость и расширяемость
2. ✅ NotificationService как роутер - единая точка входа
3. ✅ Dependency Injection для каналов - тестируемость

**Что сохранить из Current:**
1. ✅ Детализированные Event классы - типобезопасность
2. ✅ NotificationType с префиксами - понятность
3. ✅ Metadata - богатый контекст
4. ✅ Хранение в БД - in-app уведомления

**Гибридный подход = лучшее из обоих миров!**
