import { Field, ID, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { SlotFormat } from '@prisma/client';
import { Paginated } from '../../../shared';

@ObjectType()
export class SlotModel {
  @Field(() => ID)
  id: string;

  @Field(() => Date)
  startTime: Date;

  @Field(() => Date)
  endTime: Date;

  @Field(() => Int)
  price: number;

  @Field(() => SlotFormat)
  format: SlotFormat;

  @Field({ nullable: true })
  description?: string;

  @Field(() => Boolean)
  isBooked: boolean;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  @Field(() => ID)
  expertId: string;
}

@ObjectType()
export class SlotConnection extends Paginated(SlotModel) {}
