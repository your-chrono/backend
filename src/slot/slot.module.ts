import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { DatabaseModule } from '../database';
import { SLOT_QUERIES } from './queries';
import { SLOT_COMMANDS } from './commands';
import { SlotApiService } from './slot-api.service';

@Module({
  imports: [CqrsModule, DatabaseModule],
  providers: [SlotApiService, ...SLOT_COMMANDS, ...SLOT_QUERIES],
  exports: [SlotApiService],
})
export class SlotModule {}
