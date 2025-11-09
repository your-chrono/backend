import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { Paginated } from '../../../shared';
import { TransactionType } from '@prisma/client';

@ObjectType()
export class WalletModel {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  userId: string;

  @Field(() => Int)
  balance: number;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}

@ObjectType()
export class TransactionModel {
  @Field(() => ID)
  id: string;

  @Field(() => TransactionType)
  type: TransactionType;

  @Field(() => Int)
  amount: number;

  @Field({ nullable: true })
  description?: string;

  @Field(() => ID)
  walletId: string;

  @Field(() => ID, { nullable: true })
  relatedBookingId?: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}

@ObjectType()
export class TransactionConnection extends Paginated(TransactionModel) {}
