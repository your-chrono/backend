import { NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../database';
import { GetSlotQuery, GetSlotQueryReturnType } from '../impl';

@QueryHandler(GetSlotQuery)
export class GetSlotHandler
  implements IQueryHandler<GetSlotQuery, GetSlotQueryReturnType>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute({ data }: GetSlotQuery): Promise<GetSlotQueryReturnType> {
    const slot = await this.prisma.slot.findFirst({
      where: { id: data.slotId, isDeleted: false },
    });

    if (!slot) {
      throw new NotFoundException('Slot not found');
    }

    return slot;
  }
}
