import { Field, ID, InputType } from '@nestjs/graphql';

@InputType()
export class CreateBookingInput {
  @Field(() => ID)
  slotId: string;
}
