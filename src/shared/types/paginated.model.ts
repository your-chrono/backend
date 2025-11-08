import { Type } from '@nestjs/common';
import { Field, Int, ObjectType } from '@nestjs/graphql';
import { IPageInfo, IPaginatedType } from './pagination';

@ObjectType()
export class PageInfo implements IPageInfo {
  @Field({ nullable: true })
  endCursor?: string;

  @Field(() => Boolean)
  hasNextPage: boolean;

  @Field(() => Boolean)
  hasPreviousPage: boolean;

  @Field({ nullable: true })
  startCursor?: string;
}

export function Paginated<T>(
  classRef: Type<T>,
  options: { nullableNode?: boolean } = {},
): Type<IPaginatedType<T>> {
  @ObjectType(`${classRef.name}Edge`)
  abstract class EdgeType {
    @Field(() => String)
    cursor: string;

    @Field(() => classRef, { nullable: options.nullableNode })
    node: T;
  }

  @ObjectType({ isAbstract: true })
  abstract class PaginatedType implements IPaginatedType<T> {
    @Field(() => [EdgeType])
    edges: EdgeType[];

    @Field(() => Int)
    totalCount: number;

    @Field(() => PageInfo)
    pageInfo: PageInfo;
  }

  return PaginatedType as Type<IPaginatedType<T>>;
}
