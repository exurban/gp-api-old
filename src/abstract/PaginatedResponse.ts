import { ClassType, Field, Int, ObjectType } from "type-graphql";

export default function PaginatedResponse<TItem>(TItemClass: ClassType<TItem>) {
  @ObjectType({ isAbstract: true })
  abstract class PaginatedResponseClass {
    @Field(() => [TItemClass])
    items: TItem[];

    @Field(() => Int)
    startCursor: number;

    @Field(() => Int)
    endCursor: number;

    @Field(() => Int)
    total: number;
  }
  return PaginatedResponseClass;
}
