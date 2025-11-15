import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class GetListInput {
  @Field(() => Int)
  first: number;

  @Field({ nullable: true })
  after?: string;
}

@InputType()
export class DateIntervalInput {
  @Field(() => Date, { nullable: true })
  from?: Date;

  @Field(() => Date, { nullable: true })
  to?: Date;
}

@InputType()
export class NumberIntervalInput {
  @Field(() => Int, { nullable: true })
  from?: number;

  @Field(() => Int, { nullable: true })
  to?: number;
}
