import { Field, ID, InputType } from '@nestjs/graphql';
import { BookingStatus } from '@prisma/client';

@InputType()
export class UpdateBookingStatusInput {
  @Field(() => ID)
  bookingId: string;

  @Field(() => BookingStatus)
  status: BookingStatus;

  @Field(() => Date, { nullable: true })
  expectedVersion?: Date;
}
