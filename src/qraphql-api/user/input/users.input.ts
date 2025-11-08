import { Field, InputType } from '@nestjs/graphql';
import { GetListInput } from '../../../shared';

@InputType()
export class UsersInput extends GetListInput {
  @Field({ nullable: true })
  search?: string;
}
