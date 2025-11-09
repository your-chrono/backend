import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class UpdateProfileInput {
  @Field({ nullable: true })
  bio?: string;

  @Field(() => Int, { nullable: true })
  pricePerHour?: number;

  @Field(() => [String], { nullable: true })
  tagIds?: string[];
}
