import { Field, Float, ID, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import PhotoFinish from "./PhotoFinish";

@ObjectType()
@Entity({ name: "finishes" })
export default class Finish extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn("increment")
  readonly id: number;

  @Field()
  @Column()
  name: string;

  @Field()
  @Column()
  description: string;

  @Field()
  @Column()
  photoUrl: string;

  @Field({
    nullable: true,
    description: "finSku: Finish SKU. imgSku + finSku = ProductSku.",
  })
  @Column({ unique: true, nullable: true })
  finSku: string;

  @Field(() => Float)
  @Column("float")
  width: number;

  @Field(() => Float)
  @Column("float")
  height: number;

  @Field(() => Float)
  @Column("float")
  depth: number;

  @Field(() => Float)
  @Column("float")
  weight: number;

  @Field(() => Float)
  @Column("float")
  shippingWeight: number;

  @Field(() => Float)
  @Column("float")
  basePrice: number;

  @Field(() => Float)
  @Column("float")
  priceModifier: number;

  @Field(() => [PhotoFinish])
  @OneToMany(() => PhotoFinish, (pf) => pf.finish)
  photosWithFinish: Promise<PhotoFinish[]>;

  @Field()
  @CreateDateColumn({ type: "timestamptz" })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt: Date;
}
