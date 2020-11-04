import { Field, ID, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

import UserFavorite from "./UserFavorite";
import UserShoppingBagItem from "./UserShoppingBagItem";

@ObjectType()
@Entity({ name: "users" })
export default class User extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Field()
  @Column({ type: "varchar", nullable: true })
  name: string;

  @Field()
  @Index({ unique: true })
  @Column({ type: "varchar", nullable: true })
  email: string;

  @Field({ nullable: true })
  @Column({ type: "timestamptz", nullable: true })
  email_verified: Date;

  @Field({ nullable: true })
  @Column({ type: "varchar", nullable: true })
  image: string;

  // roles
  @Field(() => [String])
  @Column("simple-array", { default: "USER" })
  roles: string[];

  @Field(() => Boolean)
  @Column({ type: "boolean", default: false })
  isSubscribed: boolean;

  @Field(() => [UserFavorite])
  @OneToMany(() => UserFavorite, (fav) => fav.user)
  userFavorites: Promise<UserFavorite[]>;

  @Field(() => [UserShoppingBagItem])
  @OneToMany(() => UserShoppingBagItem, (sb) => sb.user)
  userShoppingBagItems: Promise<UserShoppingBagItem[]>;

  @Field()
  @CreateDateColumn({ type: "timestamptz" })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt: Date;
}
