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
import PhotoFinish from "./PhotoFinish";
import Image from "./Image";

@ObjectType()
@Entity({ name: "finishes" })
export default class Finish extends BaseEntity {
  @Index()
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Field({ description: "The name of the finish." })
  @Column()
  name: string;

  @Field({
    description:
      "Optional. A description of the tag used in connection with the vignette for the finish.",
  })
  @Column()
  description: string;

  @Field(() => Image, {
    nullable: true,
    description: "Optional. An image of the finish.",
  })
  @OneToOne(() => Image)
  @JoinColumn()
  coverImage?: Image;

  @Field({
    description:
      "SKU for the type of finish. Combined with width & height to create FinishSKU, which is auto-generated as a Field Resolver. ProductSKU = sku-finSku-heightxwidth",
  })
  @Column()
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

  @Field(() => [PhotoFinish], { nullable: true })
  @OneToMany(() => PhotoFinish, (pf) => pf.finish, { nullable: true })
  photosWithFinish?: Promise<PhotoFinish[]>;

  @Field(() => Int, {
    description: "Count of photos available with the finish.",
  })
  countOfPhotos: number;

  @Field()
  @CreateDateColumn({ type: "timestamptz" })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt: Date;
}
