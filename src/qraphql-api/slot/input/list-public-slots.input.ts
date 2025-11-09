import { Field, GraphQLISODateTime, ID, InputType, Int } from '@nestjs/graphql';
import { SlotFormat } from '@prisma/client';
import { GetListInput } from '../../../shared';

@InputType()
export class ListPublicSlotsInput extends GetListInput {
  @Field(() => ID)
  expertId: string;

  @Field(() => GraphQLISODateTime, { nullable: true })
  from?: Date;

  @Field(() => GraphQLISODateTime, { nullable: true })
  to?: Date;

  @Field(() => SlotFormat, { nullable: true })
  format?: SlotFormat;

  @Field(() => Int, { nullable: true })
  minPrice?: number;

  @Field(() => Int, { nullable: true })
  maxPrice?: number;
}
