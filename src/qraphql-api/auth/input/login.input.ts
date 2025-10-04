import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class LoginInput {
  @Field()
  accessToken: string;
}
