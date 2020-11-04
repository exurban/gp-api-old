import { Field, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from "typeorm";
import Photo from "./Photo";
import User from "./User";

/**
 * UserFavorites
 * Users <<-->> Photos
 */

@ObjectType()
@Entity({ name: "user_shopping_bag_items" })
export default class UserShoppingBagItem extends BaseEntity {
  /**
   * User.favorites <-->> UserFavorites.userId
   */
  @Field(() => User)
  @PrimaryColumn()
  userId: number;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.userShoppingBagItems)
  @JoinColumn({ name: "user_id" })
  user: Promise<User>;

  /**
   * UserFavorites.photoId <<--> Photo.favoritedByUsers
   */
  @Field(() => Photo)
  @PrimaryColumn()
  photoId: number;

  @Field(() => Photo)
  @ManyToOne(() => Photo, (photo) => photo.inShoppingBagsOfUsers)
  @JoinColumn({ name: "photo_id" })
  photo: Promise<Photo>;
}
