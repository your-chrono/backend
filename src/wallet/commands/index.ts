import {
  CreateWalletHandler,
  LockCreditsHandler,
  ReleaseCreditsHandler,
  RefundCreditsHandler,
  TopUpWalletHandler,
  WithdrawWalletHandler,
} from './handlers';

export const WALLET_COMMANDS = [
  CreateWalletHandler,
  TopUpWalletHandler,
  WithdrawWalletHandler,
  LockCreditsHandler,
  ReleaseCreditsHandler,
  RefundCreditsHandler,
];

export * from './impl';
