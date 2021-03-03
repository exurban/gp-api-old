import { Field, Float, ID, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import Image from "./Image";

@ObjectType()
@Entity({ name: "mats" })
export default class Mat extends BaseEntity {
  @Index({ unique: true })
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  readonly id: number;

  @Index()
  @Field()
  @Column()
  name: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  description?: string;

  @Field(() => Image, {
    nullable: true,
    description: "Optional. An image of the mat.",
  })
  @OneToOne(() => Image, { nullable: true })
  @JoinColumn()
  coverImage?: Image;

  @Field()
  @Column()
  matSku: string;

  @Index()
  @Field()
  @Column()
  aspectRatio: string;

  @Field(() => Float)
  @Column("float")
  dimension1: number;

  @Field(() => Float)
  @Column("float")
  dimension2: number;

  @Field(() => Float)
  @Column("float")
  cost: number;

  @Field(() => Float)
  @Column("float")
  shippingCost: number;

  @Field(() => Float)
  @Column("float")
  basePrice: number;

  @Field(() => Float)
  @Column("float", { default: 1.0 })
  priceModifier: number;

  @Field()
  @CreateDateColumn({ type: "timestamptz" })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt: Date;
}
