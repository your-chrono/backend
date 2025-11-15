import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Prisma } from '@prisma/client';
import { TransactionPrismaService } from '../../../database/transaction-prisma.service';
import { CreateProfileCommand, CreateProfileCommandReturnType } from '../impl';
import {
  MAX_PRICE_PER_HOUR,
  MIN_PRICE_PER_HOUR,
  MIN_BALANCE_THRESHOLD,
} from '../../../shared/constants';

@Injectable()
@CommandHandler(CreateProfileCommand)
export class CreateProfileHandler
  implements
    ICommandHandler<CreateProfileCommand, CreateProfileCommandReturnType>
{
  constructor(private readonly transaction: TransactionPrismaService) {}

  async execute({
    data,
  }: CreateProfileCommand): Promise<CreateProfileCommandReturnType> {
    this.validateInput(data);

    return this.transaction.run(() => this.createProfile(data), {
      isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead,
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

      if (data.pricePerHour > MAX_PRICE_PER_HOUR) {
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
      if (data.bio.length > MIN_PRICE_PER_HOUR) {
        throw new BadRequestException('Bio must be less than 1000 characters');
      }

      if (data.bio.length < MIN_BALANCE_THRESHOLD) {
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
      throw new NotFoundException('User not found');
    }

    // Проверка существования профиля
    const existingProfile = await this.prisma.profile.findUnique({
      where: { userId: data.userId },
    });

    if (existingProfile) {
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

    return {
      profileId: profile.id,
      userId: profile.userId,
    };
  }
}
