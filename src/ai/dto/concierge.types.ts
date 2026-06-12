import { ObjectType, Field } from '@nestjs/graphql';
import { BusinessProfile } from '../../marketplace/dto/business-profile.type';

@ObjectType()
export class ConciergeRecommendation {
  @Field(() => BusinessProfile) business: BusinessProfile;
  @Field() reason: string;
  @Field(() => [String]) matchedProducts: string[];
}

@ObjectType()
export class ConciergeResult {
  @Field() message: string;
  @Field(() => [ConciergeRecommendation]) recommendations: ConciergeRecommendation[];
  // true = răspuns de la LLM, false = fallback pe cuvinte cheie
  @Field() usedAi: boolean;
}
