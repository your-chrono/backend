import { Field, ID, InputType } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';

@InputType()
export class CreateMessageInput {
  @Field(() => ID)
  chatId: string;

  @Field(() => String, { nullable: true })
  text?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  meta?: Record<string, unknown>;

  @Field(() => ID, { nullable: true })
  replyMessageId?: string;
}
