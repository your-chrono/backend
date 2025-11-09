import { Field, InputType, Int } from '@nestjs/graphql';
import { SlotFormat } from '@prisma/client';

@InputType()
export class CreateSlotInput {
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
}
