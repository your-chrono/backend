import { Tag } from '@prisma/client';

export class ResolveTagsByProfileIdQuery {
  constructor(public readonly data: { readonly profileId: string }) {}
}

export type ResolveTagsByProfileIdQueryReturnType = Tag[];

export type ResolveTagsByProfileIdQueryData =
  ResolveTagsByProfileIdQuery['data'];
