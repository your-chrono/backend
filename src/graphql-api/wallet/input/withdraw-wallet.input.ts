import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class WithdrawWalletInput {
  @Field(() => Int)
  amount: number;

  @Field({ nullable: true })
  description?: string;
}
