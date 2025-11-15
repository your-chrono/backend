import { Field, InputType } from '@nestjs/graphql';
import { Prisma } from '@prisma/client';

@InputType()
export class ProfileOrderByInput {
  @Field(() => Prisma.SortOrder, { nullable: true })
  rating?: Prisma.SortOrder;

  @Field(() => Prisma.SortOrder, { nullable: true })
  pricePerHour?: Prisma.SortOrder;
}
