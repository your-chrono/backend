import { Field, ObjectType } from '@nestjs/graphql';
import { Prisma } from '@prisma/client';
import GraphQLJSON from 'graphql-type-json';

@ObjectType()
export class PermissionModel {
  @Field()
  id: string;

  @Field()
  action: string;

  @Field()
  subject: string;

  @Field(() => GraphQLJSON, { nullable: true })
  condition?: Prisma.JsonValue;
}
