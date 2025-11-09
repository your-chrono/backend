import { BookingStatus, SlotFormat, TagGroup, TransactionType } from '@prisma/client';
import { registerEnumType } from '@nestjs/graphql';

export const registerGraphqlEnums = () => {
  registerEnumType(TagGroup, { name: 'TagGroup' });
  registerEnumType(SlotFormat, { name: 'SlotFormat' });
  registerEnumType(BookingStatus, { name: 'BookingStatus' });
  registerEnumType(TransactionType, { name: 'TransactionType' });
};
