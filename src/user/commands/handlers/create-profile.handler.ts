import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Prisma } from '@prisma/client';
import { TransactionPrismaService } from '../../../database/transaction-prisma.service';
import { CreateProfileCommand, CreateProfileCommandReturnType } from '../impl';

@Injectable()
@CommandHandler(CreateProfileCommand)
export class CreateProfileHandler
  implements
    ICommandHandler<CreateProfileCommand, CreateProfileCommandReturnType>
{
  private readonly logger = new Logger(CreateProfileHandler.name);

  constructor(private readonly transaction: TransactionPrismaService) {}

  async execute({
    data,
  }: CreateProfileCommand): Promise<CreateProfileCommandReturnType> {
    this.validateInput(data);

    this.logger.log({
      action: 'CREATE_PROFILE_ATTEMPT',
      userId: data.userId,
    });

    return this.transaction.run(() => this.createProfile(data), {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    });
  }

  private get prisma() {
    return this.transaction.getTransaction();
  }

  private validateInput(data: CreateProfileCommand['data']): void {
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

    if (data.bio !== undefined && data.bio !== null) {
      if (data.bio.length > 1000) {
        throw new BadRequestException('Bio must be less than 1000 characters');
      }

      if (data.bio.length < 10) {
        throw new BadRequestException('Bio must be at least 10 characters');
      }
    }
  }

  private async createProfile(
    data: CreateProfileCommand['data'],
  ): Promise<CreateProfileCommandReturnType> {
    // Проверка существования пользователя
    const user = await this.prisma.user.findFirst({
      where: { id: data.userId, isDeleted: false },
      select: { id: true },
    });

    if (!user) {
      this.logger.warn({
        action: 'CREATE_PROFILE_FAILED',
        userId: data.userId,
        reason: 'User not found',
      });
      throw new NotFoundException('User not found');
    }

    // Проверка существования профиля
    const existingProfile = await this.prisma.profile.findUnique({
      where: { userId: data.userId },
    });

    if (existingProfile) {
      this.logger.warn({
        action: 'CREATE_PROFILE_FAILED',
        userId: data.userId,
        reason: 'Profile already exists',
      });
      throw new ConflictException('Profile already exists for this user');
    }

    // Создание профиля
    const profile = await this.prisma.profile.create({
      data: {
        userId: data.userId,
        bio: data.bio ?? null,
        pricePerHour: data.pricePerHour ?? null,
      },
      select: { id: true, userId: true },
    });

    this.logger.log({
      action: 'CREATE_PROFILE_SUCCESS',
      userId: data.userId,
      profileId: profile.id,
    });

    return {
      profileId: profile.id,
      userId: profile.userId,
    };
  }
}
