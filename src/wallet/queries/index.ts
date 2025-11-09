import { GetWalletHandler, ListTransactionsHandler } from './handlers';

export const WALLET_QUERIES = [GetWalletHandler, ListTransactionsHandler];

export * from './impl';
