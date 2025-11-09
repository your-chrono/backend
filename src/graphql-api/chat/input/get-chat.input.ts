import { Field, ID, InputType } from '@nestjs/graphql';

@InputType()
export class GetChatInput {
  @Field(() => ID)
  chatId: string;
}
