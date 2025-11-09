import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class TopUpWalletInput {
  @Field(() => Int)
  amount: number;

  @Field({ nullable: true })
  description?: string;
}
