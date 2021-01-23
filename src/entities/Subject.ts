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
import PhotoSubject from "./PhotoSubject";
import Image from "./Image";

@ObjectType()
@Entity({ name: "subjects" })
export default class Subject extends BaseEntity {
  @Index()
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Field()
  @Column({ unique: true })
  name: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  description?: string;

  @Field(() => Image, {
    nullable: true,
    description:
      "Optional. An image of the subject used in connection with the vignette at the top of the Subject's photos page.",
  })
  @OneToOne(() => Image)
  @JoinColumn()
  coverImage?: Image;

  @Field(() => [PhotoSubject], { nullable: true })
  @OneToMany(() => PhotoSubject, (ps) => ps.subject, { nullable: true })
  photosOfSubject?: Promise<PhotoSubject[]>;

  @Field(() => Int, {
    description: "Count of photos of the subject on the site.",
  })
  countOfPhotos: number;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
