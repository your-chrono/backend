import { Field, ID, ObjectType } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';
import { Paginated } from '../../../shared';

@ObjectType()
export class MessageModel {
  @Field(() => ID)
  id: string;

  @Field(() => String, { nullable: true })
  text?: string | null;

  @Field(() => GraphQLJSON, { nullable: true })
  meta?: Record<string, unknown> | null;

  @Field(() => Boolean)
  isDeleted: boolean;

  @Field(() => ID)
  chatId: string;

  @Field(() => ID)
  userId: string;

  @Field(() => ID, { nullable: true })
  replyMessageId?: string | null;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}

@ObjectType()
export class MessagesConnection extends Paginated(MessageModel) {}
