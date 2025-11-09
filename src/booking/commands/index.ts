import {
  CancelBookingHandler,
  CompleteBookingHandler,
  ConfirmBookingHandler,
  CreateBookingHandler,
} from './handlers';

export const BOOKING_COMMANDS = [
  CreateBookingHandler,
  ConfirmBookingHandler,
  CancelBookingHandler,
  CompleteBookingHandler,
];

export * from './impl';
