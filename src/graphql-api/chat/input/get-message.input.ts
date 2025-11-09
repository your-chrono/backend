import { Field, ID, InputType } from '@nestjs/graphql';

@InputType()
export class GetMessageInput {
  @Field(() => ID)
  messageId: string;
}
