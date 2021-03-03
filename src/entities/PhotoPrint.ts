import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from "typeorm";
import Photo from "./Photo";
import Print from "./Print";
import { Field, Float, ObjectType } from "type-graphql";

@ObjectType()
@Entity({ name: "photo_prints" })
export default class PhotoPrint extends BaseEntity {
  /**
   * Print.photosWithPrint <-->> PhotoPrint.printId
   */
  @Field(() => Print)
  @PrimaryColumn()
  printId: number;

  @Field(() => Print)
  @ManyToOne(() => Print, (print) => print.photosWithPrint)
  @JoinColumn({ name: "print_id" })
  print: Print;
  /**
   * PhotoPrint.photoId <<--> Photo.printsForPhoto
   */

  @Field(() => Photo)
  @PrimaryColumn()
  photoId: number;

  @Field(() => Photo)
  @ManyToOne(() => Photo, (photo) => photo.printsForPhoto)
  @JoinColumn({ name: "photo_id" })
  photo: Photo;

  @Field(() => Float)
  @Column("float")
  basePrice: number;

  @Field()
  @Column()
  productSku: string;
}
