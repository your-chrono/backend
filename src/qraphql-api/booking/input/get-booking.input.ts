import { Field, ID, InputType } from '@nestjs/graphql';

@InputType()
export class GetBookingInput {
  @Field(() => ID)
  bookingId: string;
}
