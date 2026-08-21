import { Global, Module } from '@nestjs/common';
import { FuzzySearchService } from './fuzzy-search.service';

@Global()
@Module({
  providers: [FuzzySearchService],
  exports: [FuzzySearchService],
})
export class FuzzySearchModule {}
