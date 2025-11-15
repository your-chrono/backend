# Prisma Schema для Notification Model

Добавьте следующую модель в `prisma/schema.prisma` для хранения уведомлений в базе данных.

## Notification Model

```prisma
model Notification {
  id        String   @id @default(cuid())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  isDeleted Boolean  @default(false)

  // Получатель уведомления
  userId String
  user   User   @relation(fields: [userId], references: [id])

  // Тип уведомления (например: 'booking.created', 'wallet.credits_added')
  type String

  // Заголовок и текст уведомления
  title   String
  message String

  // Дополнительные данные (bookingId, transactionId, и т.д.)
  metadata Json @default("{}")

  // Статус прочтения
  isRead Boolean   @default(false)
  readAt DateTime?

  // Индексы для быстрого поиска
  @@index([userId, createdAt])
  @@index([userId, isRead])
  @@index([type])
}
```

## Добавление связи в User модель

Обновите модель User, добавив связь с уведомлениями:

```prisma
model User {
  // ... существующие поля ...

  // Добавьте это поле
  notifications Notification[]

  // ... остальные поля ...
}
```

## Миграция

После добавления модели в schema.prisma, выполните миграцию:

```bash
npx prisma migrate dev --name add_notification_model
```

## Обновление NotificationService

После применения миграции, раскомментируйте код в `NotificationService.createNotification()`:

```typescript
async createNotification(data: CreateNotificationData): Promise<void> {
  try {
    this.logger.log(
      `Notification created for user ${data.userId}: ${data.type}`,
    );
    this.logger.debug(`Notification data: ${JSON.stringify(data)}`);

    // Раскомментируйте эти строки:
    await this.prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        metadata: data.metadata || {},
        isRead: false,
      },
    });
  } catch (error) {
    this.logger.error(
      `Failed to create notification: ${error.message}`,
      error.stack,
    );
  }
}
```

## Примеры метаданных по типам

### Booking Events

```typescript
// BookingCreatedEvent
metadata: {
  bookingId: string,
  slotId: string,
  creditsLocked: number,
  startTime: string, // ISO 8601
  endTime: string,   // ISO 8601
}

// BookingConfirmedEvent
metadata: {
  bookingId: string,
  slotId: string,
  expertId: string,
  startTime: string,
  endTime: string,
}

// BookingCancelledEvent
metadata: {
  bookingId: string,
  slotId: string,
  cancelledBy: string,
  creditsRefunded: number,
  reason?: string,
}
```

### Wallet Events

```typescript
// CreditsAddedEvent
metadata: {
  walletId: string,
  amount: number,
  newBalance: number,
  transactionId: string,
  description?: string,
}

// CreditsLockedEvent
metadata: {
  walletId: string,
  amount: number,
  newBalance: number,
  bookingId: string,
  transactionId: string,
}
```

## GraphQL API для Notifications (TODO)

После добавления модели, можно создать GraphQL API:

```graphql
type NotificationModel {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  userId: ID!
  type: String!
  title: String!
  message: String!
  metadata: JSON!
  isRead: Boolean!
  readAt: DateTime
}

type NotificationConnection {
  edges: [NotificationEdge!]!
  pageInfo: PageInfo!
  totalCount: Int!
}

type NotificationEdge {
  cursor: String!
  node: NotificationModel!
}

type Query {
  # Получить мои уведомления
  myNotifications(
    first: Int!
    after: String
    isRead: Boolean
  ): NotificationConnection!

  # Количество непрочитанных уведомлений
  myUnreadNotificationsCount: Int!
}

type Mutation {
  # Отметить уведомление как прочитанное
  markNotificationAsRead(notificationId: ID!): NotificationModel!

  # Отметить все уведомления как прочитанные
  markAllNotificationsAsRead: Boolean!

  # Удалить уведомление
  deleteNotification(notificationId: ID!): Boolean!
}

# WebSocket subscriptions для real-time уведомлений
type Subscription {
  # Подписаться на новые уведомления
  onNotificationReceived: NotificationModel!
}
```
