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
  AfterInsert,
  Index,
  BeforeInsert,
  OneToOne,
} from "typeorm";

import Location from "./Location";
import PhotoCollection from "./PhotoCollection";
import Image from "./Image";
import Photographer from "./Photographer";
import PhotoSubject from "./PhotoSubject";
import PhotoTag from "./PhotoTag";
import UserFavorite from "./UserFavorite";
import UserShoppingBagItem from "./UserShoppingBagItem";
import PhotoPrint from "./PhotoPrint";

@ObjectType()
@Entity({ name: "photos" })
export default class Photo extends BaseEntity {
  @Index()
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  readonly id: number;

  @Field(() => Int)
  @Column({ type: "int" })
  @Generated()
  skuGenerator: number;

  @Index()
  @Field(() => Int)
  @Column({ type: "int" })
  sku: number;

  @Index()
  @Field(() => Int)
  @Column({ type: "int" })
  sortIndex: number;

  @Index()
  @Field()
  @Column({ default: "Untitled" })
  title: string;

  @Field()
  @Column({ default: "No description provided." })
  description: string;

  @Field()
  @Column("boolean", { default: false })
  isFeatured: boolean;

  @Field()
  @Column("boolean", { default: false })
  isLimitedEdition: boolean;

  @Field()
  @Column("boolean", { default: false })
  isHidden: boolean;

  @Field(() => Int)
  @Column("int", { default: 5 })
  @Min(1)
  @Max(10)
  rating: number;

  @Field(() => [String])
  @Column("simple-array", { default: "PAPER,ALU" })
  printTypes: string[];

  @Field(() => Float, { nullable: true })
  @Column("float", { nullable: true })
  basePrice12: number;

  @Field(() => Float, { nullable: true })
  @Column("float", { default: 1, nullable: true })
  priceModifier12: number;

  @Field(() => Float, { nullable: true })
  @Column("float", { nullable: true })
  basePrice16: number;

  @Field(() => Float, { nullable: true })
  @Column("float", { default: 1, nullable: true })
  priceModifier16: number;

  @Field(() => Float, { nullable: true })
  @Column("float", { nullable: true })
  basePrice20: number;

  @Field(() => Float, { nullable: true })
  @Column("float", { default: 1, nullable: true })
  priceModifier20: number;

  @Field(() => Float, { nullable: true })
  @Column("float", { nullable: true })
  basePrice24: number;

  @Field(() => Float, { nullable: true })
  @Column("float", { default: 1, nullable: true })
  priceModifier24: number;

  @Field(() => Float, { nullable: true })
  @Column("float", { nullable: true })
  basePrice30: number;

  @Field(() => Float, { nullable: true })
  @Column("float", { default: 1, nullable: true })
  priceModifier30: number;

  @Field(() => Photographer, { nullable: true })
  @ManyToOne(() => Photographer, (photographer) => photographer.photos, {
    nullable: true,
  })
  @JoinColumn()
  photographer?: Photographer;

  @Field(() => Location, { nullable: true })
  @ManyToOne(() => Location, (location) => location.photos, { nullable: true })
  @JoinColumn()
  location?: Location;

  @Field(() => [Image])
  @OneToMany(() => Image, (img) => img.photo, { cascade: true })
  images: Image[];

  @Field(() => Image, {
    description: "A 1,200px x 600px image for sharing.",
    nullable: true,
  })
  @OneToOne(() => Image, { nullable: true })
  @JoinColumn()
  sharingImage?: Image;

  @Field(() => [PhotoSubject], { nullable: true })
  @OneToMany(() => PhotoSubject, (ps) => ps.photo)
  subjectsInPhoto: PhotoSubject[];

  @Field(() => [PhotoTag], { nullable: true })
  @OneToMany(() => PhotoTag, (ps) => ps.photo)
  tagsForPhoto: PhotoTag[];

  @Field(() => [PhotoCollection], { nullable: true })
  @OneToMany(() => PhotoCollection, (pc) => pc.photo)
  collectionsForPhoto: PhotoCollection[];

  @Field(() => [PhotoPrint], { nullable: true })
  @OneToMany(() => PhotoPrint, (pp) => pp.photo)
  printsForPhoto: PhotoPrint[];

  @Field(() => [UserFavorite], { nullable: true })
  @OneToMany(() => UserFavorite, (fav) => fav.photo)
  favoritedByUsers: Promise<UserFavorite[]>;

  @Field(() => [UserShoppingBagItem], { nullable: true })
  @OneToMany(() => UserShoppingBagItem, (sb) => sb.photo)
  inShoppingBagsOfUsers: UserShoppingBagItem[];

  @Field()
  @CreateDateColumn({ type: "timestamptz" })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt: Date;

  @BeforeInsert()
  setTempSku() {
    this.sku = 1;
  }

  @BeforeInsert()
  setTempSortIndex() {
    this.sortIndex = 1;
  }

  @AfterInsert()
  setSku() {
    this.sku = this.skuGenerator + 1000;
  }

  @AfterInsert()
  setSortIndex() {
    const siString = "5" + (this.skuGenerator + 1000).toString();
    this.sortIndex = parseInt(siString);
  }
}
