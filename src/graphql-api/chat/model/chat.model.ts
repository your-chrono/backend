import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ChatModel {
  @Field(() => ID)
  id: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  @Field(() => ID, { nullable: true })
  bookingId?: string;
}
