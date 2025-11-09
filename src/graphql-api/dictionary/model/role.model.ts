import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { PermissionModel } from './permission.model';
import { RoleId } from '@prisma/client';

registerEnumType(RoleId, {
  name: 'RoleId',
  description: 'Role identifiers as defined in the Prisma schema',
});

@ObjectType()
export class RoleModel {
  @Field(() => RoleId)
  id: RoleId;

  @Field()
  name: string;

  @Field(() => [PermissionModel])
  permissions: PermissionModel[];
}
