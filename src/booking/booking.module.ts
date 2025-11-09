import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { DatabaseModule } from '../database';
import { BookingApiService } from './booking-api.service';
import { BOOKING_COMMANDS } from './commands';
import { BOOKING_QUERIES } from './queries';
import { WalletModule } from '../wallet/wallet.module';

@Module({
  imports: [CqrsModule, DatabaseModule, WalletModule],
  providers: [BookingApiService, ...BOOKING_COMMANDS, ...BOOKING_QUERIES],
  exports: [BookingApiService],
})
export class BookingModule {}
