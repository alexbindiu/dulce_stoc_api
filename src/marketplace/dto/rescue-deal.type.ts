import { ObjectType, Field, ID, Int, Float } from '@nestjs/graphql';

// O ofertă „Dulce Rescue" — produs aproape de expirare, cu reducere.
@ObjectType()
export class RescueDeal {
  @Field(() => ID) id: string; // id-ul produsului
  @Field() name: string;
  @Field() category: string;
  @Field({ nullable: true }) description?: string;
  @Field(() => Float) originalPrice: number;
  @Field(() => Float) finalPrice: number;
  @Field(() => Int) discountPercent: number;
  @Field() free: boolean; // în ultimele 24h înainte de expirare → gratis
  @Field({ nullable: true }) expiryDate?: string;
  @Field(() => Int) stock: number;
  @Field(() => ID) businessId: string;
  @Field() businessName: string;
  @Field() businessType: string;
  @Field() county: string;
}
