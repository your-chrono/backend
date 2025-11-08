import { Field, Int, ObjectType } from '@nestjs/graphql';
import { TagModel } from './tag.model';

@ObjectType()
export class ProfileModel {
  @Field()
  id: string;

  @Field({ nullable: true })
  bio?: string;

  @Field(() => Int, { nullable: true })
  pricePerHour?: number;

  @Field()
  rating: number;

  @Field()
  verified: boolean;

  @Field(() => [TagModel])
  tags: TagModel[];
}
