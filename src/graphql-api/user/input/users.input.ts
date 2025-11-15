import { Field, InputType } from '@nestjs/graphql';
import { GetListInput, NumberIntervalInput } from '../../../shared';
import { TagGroup } from '@prisma/client';

@InputType()
export class UsersInput extends GetListInput {
  @Field({ nullable: true })
  search?: string;

  @Field(() => NumberIntervalInput, { nullable: true })
  rating?: NumberIntervalInput;

  @Field(() => NumberIntervalInput, { nullable: true })
  pricePerHour?: NumberIntervalInput;

  @Field(() => [TagGroup], { nullable: true })
  tagGroups?: TagGroup[];
}
