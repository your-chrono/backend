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
      isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead,
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

    if (data.pricePerHour !== undefined && data.pricePerHour !== null) {
      if (data.pricePerHour < 0) {
        throw new BadRequestException(
          'Price per hour must be a positive number or null',
        );
      }

      if (data.pricePerHour > 1_000_000) {
        throw new BadRequestException(
          'Price per hour exceeds maximum limit of 1,000,000 credits',
        );
      }

      if (!Number.isInteger(data.pricePerHour)) {
        throw new BadRequestException('Price per hour must be an integer');
      }

      if (!Number.isFinite(data.pricePerHour)) {
        throw new BadRequestException('Price per hour must be a finite number');
      }
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

    // Проверка существования профиля
    const profile = await this.prisma.profile.findFirst({
      where: { userId: data.userId, isDeleted: false },
      select: { id: true },
    });

    if (!profile) {
      throw new NotFoundException(
        'Profile not found. Please create profile first using createProfile command.',
      );
    }

    // Подготовка данных для обновления
    const patch: Prisma.ProfileUncheckedUpdateInput = {};

    if (data.bio !== undefined) {
      patch.bio = data.bio;
    }

    if (data.pricePerHour !== undefined) {
      patch.pricePerHour = data.pricePerHour;
    }

    // Обновление профиля
    await this.prisma.profile.update({
      where: { id: profile.id },
      data: patch,
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
