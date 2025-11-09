import { Field, ID, InputType } from '@nestjs/graphql';

@InputType()
export class DeleteSlotInput {
  @Field(() => ID)
  slotId: string;
}
