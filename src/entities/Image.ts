import { Field, ID, Int, ObjectType } from "type-graphql";
import {
  BaseEntity,
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

import Photo from "./Photo";

@ObjectType()
@Entity({ name: "images" })
export default class Image extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column({ default: "New Image" })
  imageName: string;

  @Field()
  @Column({ default: "webp" })
  fileExtension: string;

  @Field()
  @Column({ default: "" })
  imageUrl: string;

  @Field()
  @Column({ default: "new image" })
  altText: string;

  @Field()
  @Column({ default: "XL" })
  size: string;

  @Field(() => Int)
  @Column("int", { default: 0 })
  width: number;

  @Field(() => Int)
  @Column("int", { default: 0 })
  height: number;

  @Field(() => Boolean)
  @Column("boolean", { default: false })
  isPortrait: boolean;

  @Field(() => Boolean)
  @Column("boolean", { default: false })
  isPanoramic: boolean;

  @Field(() => Photo, { nullable: true })
  @ManyToOne(() => Photo, (p) => p.images, { nullable: true })
  @JoinColumn()
  photo?: Photo;

  @Field()
  @CreateDateColumn({ type: "timestamptz" })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt: Date;

  @BeforeInsert()
  setIsPortrait() {
    this.isPortrait = this.height > this.width;
  }

  @BeforeInsert()
  setIsPanoramic() {
    this.isPanoramic = this.width / 2 > this.height;
  }
}
