import { Field, InputType, Int } from '@nestjs/graphql';
import { SlotFormat } from '@prisma/client';

@InputType()
export class SyncSlotPayloadInput {
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

@InputType()
export class SyncSlotsWindowInput {
  @Field(() => Date)
  from: Date;

  @Field(() => Date)
  to: Date;
}

@InputType()
export class SyncSlotsInput {
  @Field(() => SyncSlotsWindowInput)
  window: SyncSlotsWindowInput;

  @Field(() => [SyncSlotPayloadInput])
  slots: SyncSlotPayloadInput[];
}
