import { Field, ID, InputType } from '@nestjs/graphql';

@InputType()
export class UpdateMessageInput {
  @Field(() => ID)
  messageId: string;

  @Field(() => String, { nullable: true })
  text?: string;
}
