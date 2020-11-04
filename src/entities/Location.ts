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
import Photo from "./Photo";

@ObjectType()
@Entity({ name: "locations" })
export default class Location extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn("increment")
  readonly id: number;

  @Field()
  @Column({ unique: true })
  name: string;

  @Field()
  @Column({ unique: true })
  tag: string;

  @Field(() => [Photo])
  @OneToMany(() => Photo, (photo) => photo.location)
  photos: Photo[];

  @Field()
  @CreateDateColumn({ type: "timestamptz" })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt: Date;
}
