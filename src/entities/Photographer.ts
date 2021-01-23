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
import Photo from "./Photo";
import Image from "./Image";

@ObjectType()
@Entity({ name: "photographers" })
export default class Photographer extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  readonly id: number;

  @Field({
    description: "The artist's full name",
  })
  @Column()
  name: string;

  @Field({
    description: "The artist's first name.",
  })
  @Column()
  firstName: string;

  @Field({
    description: "The artist's last name.",
  })
  @Column()
  lastName: string;

  @Field({
    description: "The artist's email address.",
  })
  @Column()
  email: string;

  @Field(() => Image, {
    description: "The Image for the artist's portrait.",
    nullable: true,
  })
  @OneToOne(() => Image, { nullable: true })
  @JoinColumn()
  coverImage?: Image;

  @Field({
    description: "The artist's biography.",
  })
  @Column("text")
  bio: string;

  @Field(() => [Photo], {
    description: "Photos attributed to the artist.",
    nullable: true,
  })
  @OneToMany(() => Photo, (photo) => photo.photographer, { nullable: true })
  photos?: Photo[];

  @Field(() => Int, {
    description: "Count of photos attributed to the photographer on the site.",
  })
  countOfPhotos: number;

  @Field({
    description: "Date record was created.",
  })
  @CreateDateColumn({ type: "timestamptz" })
  createdAt: Date;

  @Field({
    description: "Date record was most recently updated.",
  })
  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt: Date;
}
