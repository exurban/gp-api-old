import { Field, ID, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

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

  @Field(() => [PhotoCollection])
  @OneToMany(() => PhotoCollection, (pc) => pc.collection)
  photosInCollection: Promise<PhotoCollection[]>;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
