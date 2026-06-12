import { Resolver, Query, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { AiService } from './ai.service';
import { ConciergeResult } from './dto/concierge.types';

// Orice utilizator autentificat (inclusiv clienții) poate întreba asistentul.
@Resolver()
@UseGuards(GqlAuthGuard)
export class AiResolver {
  constructor(private readonly aiService: AiService) {}

  @Query(() => ConciergeResult)
  askConcierge(@Args('query') query: string): Promise<ConciergeResult> {
    return this.aiService.ask(query);
  }
}
