import { Global, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { DatabaseModule } from 'src/database/database.module';
import { DICTIONARY_QUERIES } from './queries';
import { DictionaryApiService } from './dictionary-api.service';

@Global()
@Module({
  imports: [CqrsModule, DatabaseModule],
  providers: [...DICTIONARY_QUERIES, DictionaryApiService],
  exports: [DictionaryApiService],
})
export class DictionaryModule {}
