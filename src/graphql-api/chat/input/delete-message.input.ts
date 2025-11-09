import { Field, ID, InputType } from '@nestjs/graphql';

@InputType()
export class DeleteMessageInput {
  @Field(() => ID)
  messageId: string;
}
