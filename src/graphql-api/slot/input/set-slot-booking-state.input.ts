import { Field, ID, InputType } from '@nestjs/graphql';

@InputType()
export class SetSlotBookingStateInput {
  @Field(() => ID)
  slotId: string;

  @Field()
  isBooked: boolean;

  @Field(() => Date, { nullable: true })
  expectedVersion?: Date;
}
