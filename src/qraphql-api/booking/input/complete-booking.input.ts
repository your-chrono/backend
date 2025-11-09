import { Field, ID, InputType } from '@nestjs/graphql';

@InputType()
export class CompleteBookingInput {
  @Field(() => ID)
  bookingId: string;

  @Field(() => Date, { nullable: true })
  expectedVersion?: Date;
}
