import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { WalletApiService } from '../../wallet/wallet-api.service';
import { GqlAuthGuard } from '../../auth/gql-auth.guard';
import { CurrentUser } from '../current-user.decorator';
import { UserType } from '../../auth/types';
import {
  ListMyTransactionsInput,
  TopUpWalletInput,
  WithdrawWalletInput,
} from './input';
import { TransactionConnection, WalletModel } from './model';

@UseGuards(GqlAuthGuard)
@Resolver(() => WalletModel)
export class WalletResolver {
  constructor(private readonly walletApi: WalletApiService) {}

  @Query(() => WalletModel)
  myWallet(@CurrentUser() user: UserType) {
    return this.walletApi.getWallet({ userId: user.userId });
  }

  @Query(() => TransactionConnection)
  myTransactions(
    @CurrentUser() user: UserType,
    @Args('data') data: ListMyTransactionsInput,
  ) {
    return this.walletApi.listTransactions({
      userId: user.userId,
      ...data,
    });
  }

  @Mutation(() => WalletModel)
  topUpMyWallet(
    @CurrentUser() user: UserType,
    @Args('data') data: TopUpWalletInput,
  ) {
    return this.walletApi.topUpWallet({
      userId: user.userId,
      ...data,
    });
  }

  @Mutation(() => WalletModel)
  withdrawMyWallet(
    @CurrentUser() user: UserType,
    @Args('data') data: WithdrawWalletInput,
  ) {
    return this.walletApi.withdrawWallet({
      userId: user.userId,
      ...data,
    });
  }
}
