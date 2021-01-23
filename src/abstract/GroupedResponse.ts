import Photo from "../entities/Photo";
import { Field, ObjectType } from "type-graphql";

export default function GroupedResponse<Photo>() {
  @ObjectType({ isAbstract: true })
  abstract class GroupedResponseClass {
    @Field(() => [Photo])
    photos: Photo[];
  }
  return GroupedResponseClass;
}
