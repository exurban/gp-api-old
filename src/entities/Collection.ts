import { Field, ID, Int, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import Image from "./Image";

import PhotoCollection from "./PhotoCollection";

@ObjectType()
@Entity({ name: "collections" })
export default class Collection extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column({ unique: true })
  name: string;

  @Field()
  @Column({ unique: true })
  tag: string;

  @Field()
  @Column("text")
  description: string;

  @Field({ nullable: true })
  @OneToOne(() => Image, { nullable: true })
  @JoinColumn()
  coverImage?: Image;

  @Field(() => [PhotoCollection], { nullable: true })
  @OneToMany(() => PhotoCollection, (pc) => pc.collection, { nullable: true })
  photosInCollection?: Promise<PhotoCollection[]>;

  @Field(() => Int, {
    description: "Count of photos in the collection.",
  })
  countOfPhotos: number;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
