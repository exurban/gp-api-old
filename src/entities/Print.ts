import { Field, Float, ID, ObjectType } from "type-graphql";
import {
  BeforeInsert,
  BeforeUpdate,
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import Image from "./Image";
import Product from "./Product";

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
  @Column({ nullable: true })
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

  @Field(() => Float)
  retailPrice: number;

  @Field(() => [Product], { nullable: true })
  @OneToMany(() => Product, (product) => product.print)
  products?: Product[];

  @Field()
  @CreateDateColumn({ type: "timestamptz" })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt: Date;

  @BeforeInsert()
  @BeforeUpdate()
  setAspectRatio() {
    console.log(`setting AR`);
    if (this.dimension1 === this.dimension2) {
      this.aspectRatio = "1:1";
    }

    const ar = this.dimension1 / this.dimension2;
    switch (true) {
      case ar < 0.3:
        this.aspectRatio = "1:4";
        break;
      case ar < 0.4:
        this.aspectRatio = "1:3";
        break;
      case ar < 0.6:
        this.aspectRatio = "1:2";
        break;
      case ar < 0.72:
        this.aspectRatio = "2:3";
        break;
      case ar < 0.94:
        this.aspectRatio = "4:5";
        break;
      default:
        this.aspectRatio = "1:1";
    }
  }

  @BeforeUpdate()
  updateAspectRatio() {
    console.log(`updating aspect ratio.`);
    if (this.dimension1 === this.dimension2) {
      this.aspectRatio = "1:1";
    }

    const ar = this.dimension1 / this.dimension2;
    switch (true) {
      case ar < 0.3:
        this.aspectRatio = "1:4";
        break;
      case ar < 0.4:
        this.aspectRatio = "1:3";
        break;
      case ar < 0.6:
        this.aspectRatio = "1:2";
        break;
      case ar < 0.72:
        this.aspectRatio = "2:3";
        break;
      case ar < 0.94:
        this.aspectRatio = "4:5";
        break;
      default:
        this.aspectRatio = "1:1";
    }
  }
}
