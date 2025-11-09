import { Field, ID, InputType } from '@nestjs/graphql';

@InputType()
export class CancelBookingInput {
  @Field(() => ID)
  bookingId: string;

  @Field({ nullable: true })
  reason?: string;

  @Field(() => Date, { nullable: true })
  expectedVersion?: Date;
}
