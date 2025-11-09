import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { BookingStatus } from '@prisma/client';
import { Paginated } from '../../../shared';

@ObjectType()
export class BookingModel {
  @Field(() => ID)
  id: string;

  @Field(() => BookingStatus)
  status: BookingStatus;

  @Field(() => Int)
  creditsLocked: number;

  @Field(() => ID)
  chatId: string;

  @Field(() => ID)
  userId: string;

  @Field(() => ID)
  slotId: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}

@ObjectType()
export class BookingConnection extends Paginated(BookingModel) {}
