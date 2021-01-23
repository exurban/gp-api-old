import Photo from "../entities/Photo";
import { Field, Int, ObjectType } from "type-graphql";

export function PaginatedPhotosResponse<PaginatedResponse>() {
  @ObjectType({ isAbstract: true })
  abstract class PaginatedPhotosResponseClass {
    @Field(() => [Photo])
    photos: Photo[];

    @Field(() => PaginatedResponse)
    pageInfo: PaginatedResponse;
  }
  return PaginatedPhotosResponseClass;
}

@ObjectType()
class PaginatedResponse {
  @Field(() => Int)
  startCursor: number;

  @Field(() => Int)
  endCursor: number;

  @Field(() => Int)
  total: number;
}
