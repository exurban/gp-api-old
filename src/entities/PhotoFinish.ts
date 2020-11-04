import {
  BaseEntity,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from "typeorm";
import Photo from "./Photo";
import Finish from "./Finish";
import { Field, ObjectType } from "type-graphql";

@ObjectType()
@Entity({ name: "photo_finishes" })
export default class PhotoFinish extends BaseEntity {
  /**
   * Finish.photosWithFinish <-->> PhotoFinish.finishId
   */
  @Field(() => Finish)
  @PrimaryColumn()
  finishId: number;

  @Field(() => Finish)
  @ManyToOne(() => Finish, (finish) => finish.photosWithFinish)
  @JoinColumn({ name: "finish_id" })
  finish: Finish;
  /**
   * PhotoFinish.photoId <<--> Photo.finishesForPhoto
   */

  @Field(() => Photo)
  @PrimaryColumn()
  photoId: number;

  @Field(() => Photo)
  @ManyToOne(() => Photo, (photo) => photo.finishesForPhoto)
  @JoinColumn({ name: "photo_id" })
  photo: Photo;
}
