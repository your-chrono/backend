import { PrismaClient, RoleId } from '@prisma/client';
import { nanoid } from 'nanoid';
import * as bcrypt from 'bcryptjs';
import { SALT_OF_ROUNDS } from '../../src/auth/constant';

const ADMIN_USER_EMAIL = 'admin@chrono.ru';

export async function admin(prisma: PrismaClient) {
  if (
    process.env.NODE_ENV === 'production' &&
    !process.env.ADMIN_INITIAL_PASSWORD
  ) {
    throw new Error(
      'Set ADMIN_INITIAL_PASSWORD env for admin seeding in production',
    );
  }

  const password = process.env.ADMIN_INITIAL_PASSWORD ?? '12345678';

  const initialHashedPassword = await bcrypt.hash(password, SALT_OF_ROUNDS);

  const adminUser = await prisma.user.findUnique({
    where: {
      email: ADMIN_USER_EMAIL,
    },
    select: {
      id: true,
    },
  });

  if (adminUser) {
    return;
  }

  await prisma.user.create({
    data: {
      id: nanoid(),
      email: ADMIN_USER_EMAIL,
      password: initialHashedPassword,
      role: { connect: { id: RoleId.ADMIN } },
      isEmailConfirmed: true,
    },
  });
}
