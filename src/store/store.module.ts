import { Module } from '@nestjs/common';
import { InMemoryStoreService } from './in-memory-store.service.js';

@Module({
  providers: [InMemoryStoreService],
  exports: [InMemoryStoreService],
})
export class StoreModule {}
