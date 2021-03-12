import { Field, Float, ID, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import Photo from "./Photo";
import Print from "./Print";
import Mat from "./Mat";
import Frame from "./Frame";

@ObjectType()
@Entity({ name: "products" })
export default class Product extends BaseEntity {
  @Index({ unique: true })
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  readonly id: number;

  @Field()
  @Column()
  photo: Photo;

  @Field()
  @Column()
  print: Print;

  @Field()
  @Column()
  mat: Mat;

  @Field()
  @Column()
  frame: Frame;

  @Field(() => Float)
  totalRetailPrice: number;

  @Field()
  @CreateDateColumn({ type: "timestamptz" })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt: Date;
}
