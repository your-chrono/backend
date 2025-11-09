import { Field, GraphQLISODateTime, ID, ObjectType } from '@nestjs/graphql';
import { ProfileModel } from './profile.model';
import { RoleModel } from '../../dictionary/model';
import { Paginated } from '../../../shared';

@ObjectType()
export class UserModel {
  @Field(() => ID)
  id: string;

  @Field()
  email: string;

  @Field(() => RoleModel)
  role: RoleModel;

  @Field(() => GraphQLISODateTime)
  createdAt: Date;

  @Field(() => GraphQLISODateTime)
  updatedAt: Date;

  @Field(() => ProfileModel, { nullable: true })
  profile?: ProfileModel | null;
}

@ObjectType()
export class UserConnection extends Paginated(UserModel) {}
