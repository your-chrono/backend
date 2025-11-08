import { PrismaClient, Role, RoleId } from '@prisma/client';
import { PermissionId } from './permissions';

type RoleWithPermissions = Pick<Role, 'id' | 'name'> & {
  permissions: PermissionId[];
};

export async function roles(prisma: PrismaClient): Promise<void> {
  const roles: RoleWithPermissions[] = [
    {
      id: RoleId.USER,
      name: 'Администратор',
      permissions: [PermissionId.view_user, PermissionId.update_user],
    },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { id: role.id },
      create: {
        id: role.id,
        name: role.name,
        permissions: {
          connect: role.permissions.map((p) => ({ id: p })),
        },
      },
      update: {
        name: role.name,
        permissions: {
          set: role.permissions.map((p) => ({ id: p })),
        },
      },
    });
  }
}
