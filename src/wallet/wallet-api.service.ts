import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  TopUpWalletCommand,
  TopUpWalletCommandData,
  TopUpWalletCommandReturnType,
  WithdrawWalletCommand,
  WithdrawWalletCommandData,
  WithdrawWalletCommandReturnType,
} from './commands';
import {
  GetWalletQuery,
  GetWalletQueryData,
  GetWalletQueryReturnType,
  ListTransactionsQuery,
  ListTransactionsQueryData,
  ListTransactionsQueryReturnType,
} from './queries';

@Injectable()
export class WalletApiService {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  getWallet(data: GetWalletQueryData) {
    return this.queryBus.execute<GetWalletQuery, GetWalletQueryReturnType>(
      new GetWalletQuery(data),
    );
  }

  listTransactions(data: ListTransactionsQueryData) {
    return this.queryBus.execute<
      ListTransactionsQuery,
      ListTransactionsQueryReturnType
    >(new ListTransactionsQuery(data));
  }

  async topUpWallet(data: TopUpWalletCommandData) {
    await this.commandBus.execute<
      TopUpWalletCommand,
      TopUpWalletCommandReturnType
    >(new TopUpWalletCommand(data));

    return this.getWallet({ userId: data.userId });
  }

  async withdrawWallet(data: WithdrawWalletCommandData) {
    await this.commandBus.execute<
      WithdrawWalletCommand,
      WithdrawWalletCommandReturnType
    >(new WithdrawWalletCommand(data));

    return this.getWallet({ userId: data.userId });
  }
}
