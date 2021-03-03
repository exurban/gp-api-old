import { Field, Float, ID, Int, ObjectType } from "type-graphql";
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
import PhotoPrint from "./PhotoPrint";
import Image from "./Image";

@ObjectType()
@Entity({ name: "prints" })
export default class Print extends BaseEntity {
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

  @Index()
  @Field()
  @Column()
  type: string;

  @Field(() => Image, {
    nullable: true,
    description: "Optional. An image of the print.",
  })
  @OneToOne(() => Image, { nullable: true })
  @JoinColumn()
  coverImage?: Image;

  @Field()
  @Column()
  printSku: string;

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

  @Field(() => [PhotoPrint], { nullable: true })
  @OneToMany(() => PhotoPrint, (pp) => pp.print, { nullable: true })
  photosWithPrint?: Promise<PhotoPrint[]>;

  @Field(() => Int)
  countOfPhotos: number;

  @Field()
  @CreateDateColumn({ type: "timestamptz" })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt: Date;
}
