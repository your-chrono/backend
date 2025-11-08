import { PrismaClient } from '@prisma/client';
import { permissions } from './permissions';
import { roles } from './roles';
import { admin } from './admin';
import { tags } from './tags';

async function main(prisma: PrismaClient) {
  await permissions(prisma);
  await roles(prisma);
  await admin(prisma);
  await tags(prisma);
}

export const initSeed = async (prisma: PrismaClient): Promise<boolean> => {
  try {
    await main(prisma);
    await prisma.$disconnect();
    return true;
  } catch (error) {
    await prisma.$disconnect();
    throw error;
  }
};

void initSeed(new PrismaClient());
