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
import PhotoSubject from "./PhotoSubject";

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

  @Field(() => [PhotoSubject])
  @OneToMany(() => PhotoSubject, (ps) => ps.subject)
  photosOfSubject: Promise<PhotoSubject[]>;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
