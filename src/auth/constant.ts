export const SALT_OF_ROUNDS = 10;

export enum PermissionAction {
  create = 'create',
  view = 'view',
  delete = 'delete',
  cancel = 'cancel',
  repeat = 'repeat',
  update = 'update',
  manage = 'manage',

  view_all = 'view_all',
  update_all = 'update_all',
}

export enum PermissionSubject {
  user = 'user',
  slot = 'slot',
}
