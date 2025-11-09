import { Field, InputType, Int } from '@nestjs/graphql';
import { TransactionType } from '@prisma/client';

@InputType()
export class ListMyTransactionsInput {
  @Field(() => Int)
  first: number;

  @Field({ nullable: true })
  after?: string;

  @Field(() => TransactionType, { nullable: true })
  type?: TransactionType;
}
