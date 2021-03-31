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
import Product from "./Product";
import Order from "./Order";

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

  // Ben Awad: https://github.com/benawad/type-graphql-series/blob/master/src/entity/Author.ts
  // * Doesn't expose the field
  // @OneToMany(() => AuthorBook, (ab) => ab.author)
  // bookConnection: Promise<AuthorBook[]>;

  @Field(() => [UserFavorite])
  @OneToMany(() => UserFavorite, (fav) => fav.user)
  userFavorites: Promise<UserFavorite[]>;

  @Field(() => [Order])
  @OneToMany(() => Order, (order) => order.user)
  orders: Promise<Order[]>;

  @Field(() => [Product], { nullable: true })
  @OneToMany(() => Product, (product) => product.shoppingBag, {
    nullable: true,
  })
  shoppingBagItems?: Product[];

  @Field()
  @CreateDateColumn({ type: "timestamptz" })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt: Date;
}
