import { Field, ID, Int, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import PhotoCollection from "./PhotoCollection";
import Image from "./Image";

@ObjectType()
@Entity({ name: "collections" })
export default class Collection extends BaseEntity {
  @Index()
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  readonly id: number;

  @Index({ unique: true })
  @Field()
  @Column({ unique: true })
  name: string;

  @Field()
  @Column({ unique: true })
  tag: string;

  @Field()
  @Column()
  description: string;

  @Field(() => Image, {
    nullable: true,
    description:
      "Optional. An image of the tag used in connection with the vignetter at the top of the Tag's photos page.",
  })
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
