import {
  BookingCreatedHandler,
  BookingConfirmedHandler,
  BookingRejectedHandler,
  BookingCancelledHandler,
  BookingCompletedHandler,
  BookingReminderHandler,
} from './booking-notification.handler';

import {
  CreditsAddedHandler,
  CreditsWithdrawnHandler,
  CreditsLockedHandler,
  CreditsReleasedHandler,
  CreditsRefundedHandler,
  LowBalanceHandler,
} from './wallet-notification.handler';

export const BOOKING_NOTIFICATION_HANDLERS = [
  BookingCreatedHandler,
  BookingConfirmedHandler,
  BookingRejectedHandler,
  BookingCancelledHandler,
  BookingCompletedHandler,
  BookingReminderHandler,
];

export const WALLET_NOTIFICATION_HANDLERS = [
  CreditsAddedHandler,
  CreditsWithdrawnHandler,
  CreditsLockedHandler,
  CreditsReleasedHandler,
  CreditsRefundedHandler,
  LowBalanceHandler,
];

export const NOTIFICATION_HANDLERS = [
  ...BOOKING_NOTIFICATION_HANDLERS,
  ...WALLET_NOTIFICATION_HANDLERS,
];
