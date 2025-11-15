export interface NotificationChannel {
  supports(channelType: string): boolean;
  send(type: NotificationType, data: NotificationData): Promise<void>;
}

export enum ChannelType {
  EMAIL = 'EMAIL',
  PUSH = 'PUSH',
  SMS = 'SMS',
}

export enum NotificationType {
  BOOKING_CREATED = 'booking.created',
  BOOKING_CONFIRMED = 'booking.confirmed',
  BOOKING_REJECTED = 'booking.rejected',
  BOOKING_CANCELLED = 'booking.cancelled',
  BOOKING_COMPLETED = 'booking.completed',
  BOOKING_REMINDER = 'booking.reminder',

  CREDITS_ADDED = 'wallet.credits_added',
  CREDITS_WITHDRAWN = 'wallet.credits_withdrawn',
  CREDITS_LOCKED = 'wallet.credits_locked',
  CREDITS_RELEASED = 'wallet.credits_released',
  CREDITS_REFUNDED = 'wallet.credits_refunded',
  LOW_BALANCE = 'wallet.low_balance',
}

export interface NotificationData {
  userId: string;
  title: string;
  message: string;
  metadata?: Record<string, unknown>;
}
