import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { DatabaseModule } from '../database';
import { WalletApiService } from './wallet-api.service';
import { WALLET_COMMANDS } from './commands';
import { WALLET_QUERIES } from './queries';

@Module({
  imports: [CqrsModule, DatabaseModule],
  providers: [WalletApiService, ...WALLET_COMMANDS, ...WALLET_QUERIES],
  exports: [WalletApiService],
})
export class WalletModule {}
