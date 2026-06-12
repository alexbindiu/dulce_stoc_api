import { ObjectType, Field, ID, Int } from '@nestjs/graphql';

@ObjectType()
export class BusinessProfile {
  @Field(() => ID) id: string;
  @Field() firstName: string;
  @Field() lastName: string;
  @Field() businessName: string;
  @Field() businessType: string;
  @Field() county: string;
  @Field({ nullable: true }) phone?: string;
  @Field({ nullable: true }) description?: string;
  @Field(() => Int) productCount: number;
}
