import { Field, ID, InputType } from '@nestjs/graphql';

@InputType()
export class GetSlotInput {
  @Field(() => ID)
  slotId: string;
}
