import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class TagModel {
  @Field()
  id: string;

  @Field()
  slug: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  group?: string;
}
