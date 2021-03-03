import {
  Arg,
  Authorized,
  Field,
  Float,
  InputType,
  Int,
  Mutation,
  ObjectType,
  Resolver,
} from "type-graphql";
import { Column, Repository } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";

import PhotoPrint from "../entities/PhotoPrint";
import SuccessMessageResponse from "../abstract/SuccessMessageResponse";

@InputType()
class PhotoPrintInput {
  @Field(() => Int)
  photoId: number;

  @Field(() => Int)
  printId: number;
}

@InputType()
class AddPhotoPrintInput {
  @Field(() => Int)
  photoId: number;

  @Field(() => Int)
  printId: number;

  @Field(() => Float)
  @Column("float")
  basePrice: number;

  @Field()
  @Column()
  productSku: string;
}

@InputType()
class UpdatePhotoFinishInput {
  @Field(() => Int)
  photoId: number;

  @Field(() => Int)
  printId: number;

  @Field(() => Float)
  @Column("float")
  basePrice: number;

  @Field()
  @Column()
  productSku: string;
}

@ObjectType()
class AddPhotoPrintResponse extends SuccessMessageResponse {
  @Field(() => PhotoPrint, { nullable: true })
  newPhotoPrint?: PhotoPrint;
}

@ObjectType()
class UpdatePhotoPrintResponse extends SuccessMessageResponse {
  @Field(() => PhotoPrint, { nullable: true })
  updatedPhotoPrint?: PhotoPrint;
}

@Resolver(() => PhotoPrint)
export default class PhotoPrintResolver {
  // * Repositories
  constructor(
    @InjectRepository(PhotoPrint)
    private photoPrintRepository: Repository<PhotoPrint>
  ) {}

  // * Add
  @Authorized("ADMIN")
  @Mutation(() => AddPhotoPrintResponse)
  async addPhotoPrint(
    @Arg("input", () => AddPhotoPrintInput) input: AddPhotoPrintInput
  ): Promise<AddPhotoPrintResponse> {
    const newPhotoPrint = await this.photoPrintRepository.create(input);
    newPhotoPrint.productSku = input.productSku;
    newPhotoPrint.basePrice = input.basePrice;

    await this.photoPrintRepository.insert(newPhotoPrint);
    await this.photoPrintRepository.save(newPhotoPrint);

    return {
      success: true,
      message: `Successfully created new Photographer: ${input.productSku}`,
      newPhotoPrint: newPhotoPrint,
    };
  }

  // * Update
  @Authorized("ADMIN")
  @Mutation(() => UpdatePhotoPrintResponse)
  async updatePhotoPrint(
    @Arg("input", () => UpdatePhotoFinishInput) input: UpdatePhotoFinishInput
  ): Promise<UpdatePhotoPrintResponse> {
    const photoPrint = await this.photoPrintRepository.findOne({
      where: { photoId: input.photoId, printId: input.printId },
    });

    if (!photoPrint) {
      return {
        success: false,
        message: `Couldn't find photo print.`,
      };
    }

    const updatedPhotoPrint = {
      ...photoPrint,
      productSku: input.productSku,
      salePrice: input.basePrice,
    };

    const pp = await this.photoPrintRepository.save(updatedPhotoPrint);

    return {
      success: true,
      message: `Successfully updated ${pp.productSku}`,
      updatedPhotoPrint: pp,
    };
  }

  @Authorized("ADMIN")
  @Mutation(() => Boolean)
  async removeFinishFromPhoto(
    @Arg("input", () => PhotoPrintInput) input: PhotoPrintInput
  ): Promise<boolean> {
    const deleteResult = await this.photoPrintRepository.delete({
      photoId: input.photoId,
      printId: input.printId,
    });
    if (deleteResult && deleteResult.affected != 0) {
      return true;
    }
    return false;
  }
}
