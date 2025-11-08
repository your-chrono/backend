import { Permission, Prisma, PrismaClient } from '@prisma/client';
import { PermissionAction, PermissionSubject } from '../../src/auth/constant';

export enum PermissionId {
  view_user = 'view_user',
  update_user = 'update_user',
}

export async function permissions(prisma: PrismaClient): Promise<void> {
  const permissions: Pick<
    Permission,
    'id' | 'action' | 'subject' | 'condition'
  >[] = [
    // User
    {
      id: PermissionId.view_user,
      action: PermissionAction.view,
      subject: PermissionSubject.user,
      condition: {},
    },
    {
      id: PermissionId.update_user,
      action: PermissionAction.update,
      subject: PermissionSubject.user,
      condition: {},
    },
  ];

  for (const permission of permissions) {
    await prisma.permission.upsert({
      where: { id: permission.id },
      create: {
        id: permission.id,
        action: permission.action,
        subject: permission.subject,
        condition: permission.condition as Prisma.InputJsonValue,
      },
      update: {
        action: permission.action,
        subject: permission.subject,
        condition: permission.condition as Prisma.InputJsonValue,
      },
    });
  }
}
