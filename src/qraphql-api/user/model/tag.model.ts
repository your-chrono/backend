import { Field, ObjectType } from '@nestjs/graphql';
import { TagGroup } from '@prisma/client';

@ObjectType()
export class TagModel {
  @Field()
  id: string;

  @Field()
  slug: string;

  @Field()
  name: string;

  @Field(() => TagGroup, { nullable: true })
  group?: TagGroup;
}
