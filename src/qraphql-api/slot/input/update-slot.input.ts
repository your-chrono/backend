import { Field, ID, InputType, Int } from '@nestjs/graphql';
import { SlotFormat } from '@prisma/client';

@InputType()
export class UpdateSlotInput {
  @Field(() => ID)
  slotId: string;

  @Field(() => Date, { nullable: true })
  startTime?: Date;

  @Field(() => Date, { nullable: true })
  endTime?: Date;

  @Field(() => Int, { nullable: true })
  price?: number;

  @Field(() => SlotFormat, { nullable: true })
  format?: SlotFormat;

  @Field({ nullable: true })
  description?: string;
}
