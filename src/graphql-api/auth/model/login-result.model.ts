import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class LoginResultModel {
  @Field()
  token: string;
}
