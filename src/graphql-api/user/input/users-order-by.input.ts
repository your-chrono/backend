import { Field, InputType } from '@nestjs/graphql';
import { ProfileOrderByInput } from './profile-order-by.input';

@InputType()
export class OrdersOrderByInput {
  @Field(() => ProfileOrderByInput, { nullable: true })
  profile?: ProfileOrderByInput;
}
