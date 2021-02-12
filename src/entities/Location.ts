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
import Photo from "./Photo";
import Image from "./Image";

@ObjectType()
@Entity({ name: "locations" })
export default class Location extends BaseEntity {
  @Index()
  @Field(() => ID, {
    description:
      "The ID of the location. It is unique, numeric and automatically-generated.",
  })
  @PrimaryGeneratedColumn("increment")
  readonly id: number;

  @Field({
    description: "The name of the Location. It is required and must be unique.",
  })
  @Column({ unique: true })
  name: string;

  @Field({
    description: "A tag for the Location. It is required and must be unique.",
  })
  @Column({ unique: true })
  tag: string;

  @Field({
    description:
      "A description of the location, used as a vignette at the top of the Location's photos page.",
  })
  @Column("text")
  description: string;

  @Field(() => Image, {
    nullable: true,
    description:
      "Optional. A map of the location used in conenction with the vignette at the top of the Location's photos page.",
  })
  @OneToOne(() => Image, { nullable: true })
  @JoinColumn()
  coverImage?: Image;

  @Field(() => [Photo], {
    nullable: true,
    description: "Nullable. An array of photos taken at the Location.",
  })
  @OneToMany(() => Photo, (photo) => photo.location, { nullable: true })
  photos?: Photo[];

  @Field(() => Int, {
    description: "Count of photos taken at the location on the site.",
  })
  countOfPhotos: number;

  @Field()
  @CreateDateColumn({ type: "timestamptz" })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt: Date;
}
