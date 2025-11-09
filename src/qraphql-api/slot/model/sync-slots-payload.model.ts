import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class SyncSlotsPayload {
  @Field(() => Int)
  created: number;

  @Field(() => Int)
  updated: number;

  @Field(() => Int)
  deleted: number;
}
