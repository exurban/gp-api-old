import { Max, Min } from "class-validator";
import { Field, Float, ID, Int, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  OneToMany,
  JoinColumn,
  Generated,
  BeforeInsert,
  AfterInsert,
  Index,
} from "typeorm";

import Location from "./Location";
import PhotoCollection from "./PhotoCollection";
import Image from "./Image";
import Photographer from "./Photographer";
import PhotoSubject from "./PhotoSubject";
import PhotoTag from "./PhotoTag";
import UserFavorite from "./UserFavorite";
import UserShoppingBagItem from "./UserShoppingBagItem";
import PhotoFinish from "./PhotoFinish";

@ObjectType()
@Entity({ name: "photos" })
export default class Photo extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => Int)
  @Column({ type: "int" })
  @Generated()
  skuGenerator: number;

  @Index()
  @Field(() => Int)
  @Column({ type: "int" })
  sku: number;

  @Index()
  @Field()
  @Column({ default: "Untitled" })
  title: string;

  @Field()
  @Column({ default: "No description provided." })
  description: string;

  @Field()
  @Column("boolean", { default: false })
  discontinued: boolean;

  @Field()
  @Column("boolean", { default: false })
  isFeatured: boolean;

  @Field()
  @Column("boolean", { default: false })
  isLimitedEdition: boolean;

  @Field(() => Int)
  @Column("int", { default: 5 })
  @Min(1)
  @Max(10)
  rating: number;

  @Field(() => Float, { nullable: true })
  @Column("float", { nullable: true })
  basePrice: number;

  @Field(() => Float, { nullable: true })
  @Column("float", { nullable: true })
  priceModifier: number;

  @Field(() => Photographer)
  @ManyToOne(() => Photographer, (photographer) => photographer.photos)
  @JoinColumn()
  photographer: Photographer;

  @Field(() => Location)
  @ManyToOne(() => Location, (location) => location.photos)
  @JoinColumn()
  location: Location;

  @Field(() => [Image])
  @OneToMany(() => Image, (img) => img.photo)
  images: Image[];

  @Field(() => [PhotoSubject])
  @OneToMany(() => PhotoSubject, (ps) => ps.photo)
  subjectsInPhoto: Promise<PhotoSubject[]>;

  @Field(() => [PhotoTag])
  @OneToMany(() => PhotoTag, (ps) => ps.photo)
  tagsForPhoto: Promise<PhotoTag[]>;

  @Field(() => [PhotoCollection])
  @OneToMany(() => PhotoCollection, (pc) => pc.photo)
  collectionsForPhoto: Promise<PhotoCollection[]>;

  @Field(() => [PhotoFinish])
  @OneToMany(() => PhotoFinish, (pc) => pc.photo)
  finishesForPhoto: Promise<PhotoFinish[]>;

  @Field(() => [UserFavorite])
  @OneToMany(() => UserFavorite, (fav) => fav.photo)
  favoritedByUsers: Promise<UserFavorite[]>;

  @Field(() => [UserShoppingBagItem])
  @OneToMany(() => UserShoppingBagItem, (sb) => sb.photo)
  inShoppingBagsOfUsers: UserShoppingBagItem[];

  @Field()
  @CreateDateColumn({ type: "timestamptz" })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt: Date;

  @BeforeInsert()
  fakeSku() {
    this.sku = 1;
  }

  @AfterInsert()
  setSku() {
    this.sku = this.skuGenerator + 1000;
  }
}

//! Sunday's to dos
/** collection
 * finish
 * dimensions
 * finishDimensions
 * user
 *  - subscribe / unsubscribe
 *  - favorites
 *  - shoppingBag
 * integrate with Next-Auth
 */
