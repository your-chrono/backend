import { BookingStatus, SlotFormat, TagGroup } from '@prisma/client';
import { registerEnumType } from '@nestjs/graphql';

export const registerGraphqlEnums = () => {
  registerEnumType(TagGroup, { name: 'TagGroup' });
  registerEnumType(SlotFormat, { name: 'SlotFormat' });
  registerEnumType(BookingStatus, { name: 'BookingStatus' });
};
