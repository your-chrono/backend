import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class SlotMutationPayload {
  @Field(() => ID)
  slotId: string;
}
