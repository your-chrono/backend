import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Prisma } from '@prisma/client';
import { TransactionPrismaService } from '../../../database/transaction-prisma.service';
import {
  UpdateProfileCommand,
  UpdateProfileCommandData,
  UpdateProfileCommandReturnType,
} from '../impl';

@Injectable()
@CommandHandler(UpdateProfileCommand)
export class UpdateProfileHandler
  implements
    ICommandHandler<UpdateProfileCommand, UpdateProfileCommandReturnType>
{
  constructor(private readonly transaction: TransactionPrismaService) {}

  async execute({
    data,
  }: UpdateProfileCommand): Promise<UpdateProfileCommandReturnType> {
    this.ensurePayload(data);

    return this.transaction.run(() => this.persistProfile(data), {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    });
  }

  private get prisma() {
    return this.transaction.getTransaction();
  }

  private ensurePayload(data: UpdateProfileCommandData): void {
    if (
      data.bio === undefined &&
      data.pricePerHour === undefined &&
      data.tagIds === undefined
    ) {
      throw new BadRequestException('No profile data provided');
    }

    if (
      data.pricePerHour !== undefined &&
      data.pricePerHour !== null &&
      data.pricePerHour < 0
    ) {
      throw new BadRequestException(
        'Price per hour must be a positive number or null',
      );
    }
  }

  private async persistProfile(
    data: UpdateProfileCommandData,
  ): Promise<UpdateProfileCommandReturnType> {
    const user = await this.prisma.user.findFirst({
      where: { id: data.userId, isDeleted: false },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const patch: Prisma.ProfileUncheckedUpdateInput = {};
    const createData: Prisma.ProfileUncheckedCreateInput = {
      userId: data.userId,
    };

    if (data.bio !== undefined) {
      patch.bio = data.bio;
      createData.bio = data.bio ?? null;
    }

    if (data.pricePerHour !== undefined) {
      patch.pricePerHour = data.pricePerHour;
      createData.pricePerHour = data.pricePerHour ?? null;
    }

    const profile = await this.prisma.profile.upsert({
      where: { userId: data.userId },
      update: patch,
      create: createData,
      select: { id: true },
    });

    if (data.tagIds) {
      const uniqueTagIds = Array.from(new Set(data.tagIds));

      if (uniqueTagIds.length) {
        const tags = await this.prisma.tag.findMany({
          where: {
            id: { in: uniqueTagIds },
            isDeleted: false,
          },
          select: { id: true },
        });

        if (tags.length !== uniqueTagIds.length) {
          throw new NotFoundException('Some of the tags were not found');
        }
      }

      await this.prisma.profileTag.deleteMany({
        where: { profileId: profile.id },
      });

      if (uniqueTagIds.length) {
        await this.prisma.profileTag.createMany({
          data: uniqueTagIds.map((tagId) => ({
            profileId: profile.id,
            tagId,
          })),
        });
      }
    }

    return { userId: data.userId };
  }
}
