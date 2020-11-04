import { Field, ID, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import PhotoTag from "./PhotoTag";

@ObjectType()
@Entity({ name: "tags" })
export default class Tag extends BaseEntity {
  @Index()
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Field()
  @Column({ unique: true })
  name: string;

  @Field(() => [PhotoTag])
  @OneToMany(() => PhotoTag, (pt) => pt.tag)
  photosWithTag: Promise<PhotoTag[]>;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
