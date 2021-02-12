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
import PhotoTag from "./PhotoTag";
import Image from "./Image";

@ObjectType()
@Entity({ name: "tags" })
export default class Tag extends BaseEntity {
  @Index()
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  readonly id: number;

  @Index({ unique: true })
  @Field({ description: "The name of the tag." })
  @Column({ unique: true })
  name: string;

  @Field({
    description:
      "Optional. A description of the tag used in connection with the vignette at the top of the Tag's photo page.",
  })
  @Column()
  description: string;

  @Field(() => Image, {
    nullable: true,
    description:
      "Optional. An image of the tag used in connection with the vignette at the top of the Tag's photos page.",
  })
  @OneToOne(() => Image, { nullable: true })
  @JoinColumn()
  coverImage?: Image;

  @Field(() => [PhotoTag], {
    description:
      "A connection through a join table to the photos tagged with the tag.",
    nullable: true,
  })
  @OneToMany(() => PhotoTag, (pt) => pt.tag, { nullable: true })
  photosWithTag?: Promise<PhotoTag[]>;

  @Field(() => Int, {
    description: "Count of photos of the tag on the site.",
  })
  countOfPhotos: number;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
