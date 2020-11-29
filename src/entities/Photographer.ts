import { Field, ID, ObjectType } from "type-graphql";
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

  // derived value composed of firstName + lastName
  @Field({
    description: "Derived field that returns `${firstName} ${lastName}`",
  })
  readonly name: string;

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
  })
  @OneToMany(() => Photo, (photo) => photo.photographer)
  photos: Photo[];

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
