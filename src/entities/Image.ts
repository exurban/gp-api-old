import { Field, ID, Int, ObjectType } from "type-graphql";
import {
  BaseEntity,
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
  @Column()
  imageUrl: string;

  @Field()
  @Column()
  altText: string;

  @Field()
  @Column()
  fileType: string;

  @Field()
  @Column()
  fileExtension: string;

  @Field()
  @Column()
  size: string;

  @Field(() => Int)
  @Column("int")
  width: number;

  @Field(() => Int)
  @Column("int")
  height: number;

  @Field(() => Photo)
  @ManyToOne(() => Photo, (p) => p.images)
  @JoinColumn()
  photo: Photo;

  @Field()
  @CreateDateColumn({ type: "timestamptz" })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt: Date;
}
