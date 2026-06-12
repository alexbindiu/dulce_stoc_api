import { Resolver, Query, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { MarketplaceService } from './marketplace.service';
import { BusinessProfile } from './dto/business-profile.type';
import { Product } from '../products/entities/product.entity';

// Doar autentificare (fără rol) — și clienții (NORMAL_USER) pot vedea afacerile.
@Resolver()
@UseGuards(GqlAuthGuard)
export class MarketplaceResolver {
  constructor(private readonly service: MarketplaceService) {}

  @Query(() => [String])
  cities(): Promise<string[]> {
    return this.service.getCities();
  }

  @Query(() => [BusinessProfile])
  businesses(@Args('city', { nullable: true }) city?: string): Promise<BusinessProfile[]> {
    return this.service.getBusinesses(city);
  }

  @Query(() => BusinessProfile)
  business(@Args('id', { type: () => ID }) id: string): Promise<BusinessProfile> {
    return this.service.getBusiness(id);
  }

  @Query(() => [Product])
  businessProducts(@Args('businessId', { type: () => ID }) businessId: string): Promise<Product[]> {
    return this.service.getBusinessProducts(businessId);
  }
}
