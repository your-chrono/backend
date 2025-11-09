import { Field, InputType, Int, registerEnumType } from '@nestjs/graphql';
import { BookingStatus } from '@prisma/client';

export enum BookingListScope {
  CLIENT = 'CLIENT',
  EXPERT = 'EXPERT',
}

registerEnumType(BookingListScope, { name: 'BookingListScope' });

@InputType()
export class ListMyBookingsInput {
  @Field(() => BookingListScope, { defaultValue: BookingListScope.CLIENT })
  scope: BookingListScope = BookingListScope.CLIENT;

  @Field(() => BookingStatus, { nullable: true })
  status?: BookingStatus;

  @Field(() => Int)
  first: number;

  @Field({ nullable: true })
  after?: string;
}
