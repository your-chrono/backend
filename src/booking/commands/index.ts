import {
  CreateBookingHandler,
  UpdateBookingStatusHandler,
} from './handlers';

export const BOOKING_COMMANDS = [
  CreateBookingHandler,
  UpdateBookingStatusHandler,
];

export * from './impl';
