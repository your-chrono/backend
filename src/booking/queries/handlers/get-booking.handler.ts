import { Injectable, NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../database';
import { GetBookingQuery, GetBookingQueryReturnType } from '../impl';

@Injectable()
@QueryHandler(GetBookingQuery)
export class GetBookingHandler
  implements IQueryHandler<GetBookingQuery, GetBookingQueryReturnType>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute({ data }: GetBookingQuery) {
    const booking = await this.prisma.booking.findFirst({
      where: { id: data.bookingId, isDeleted: false },
      include: {
        slot: {
          select: { expertId: true },
        },
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    return booking;
  }
}
