export const NOTIFICATION_CHANNELS = 'NOTIFICATION_CHANNELS';

// Time constants (in milliseconds)
export const MILLISECONDS_IN_SECOND = 1000;
export const SECONDS_IN_MINUTE = 60;
export const MINUTES_IN_HOUR = 60;
export const HOURS_IN_DAY = 8; // Working day hours

// Derived time constants
export const MILLISECONDS_IN_MINUTE =
  SECONDS_IN_MINUTE * MILLISECONDS_IN_SECOND;
export const MILLISECONDS_IN_HOUR =
  MINUTES_IN_HOUR * SECONDS_IN_MINUTE * MILLISECONDS_IN_SECOND;
export const MILLISECONDS_IN_WORKING_DAY =
  HOURS_IN_DAY * MINUTES_IN_HOUR * SECONDS_IN_MINUTE * MILLISECONDS_IN_SECOND;

// Price and balance limits
export const MAX_PRICE_PER_HOUR = 1_000_000; // Maximum price per hour in credits
export const MIN_PRICE_PER_HOUR = 1000; // Minimum price per hour in credits
export const MIN_BALANCE_THRESHOLD = 10; // Minimum balance threshold
export const MIN_WITHDRAWAL_AMOUNT = 100_000; // Minimum withdrawal amount

// Slot and booking constants
export const MAX_SLOTS_PER_SYNC = 500; // Maximum number of slots in sync operation
export const MIN_TAGS_COUNT = 3; // Minimum number of tags required
