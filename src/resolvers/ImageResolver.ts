import {
  Field,
  InputType,
  Int,
  Resolver,
  Query,
  Arg,
  Authorized,
  Mutation,
} from "type-graphql";
import { Repository } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";
import Image from "../entities/Image";
import Photo from "../entities/Photo";

// * Input Types
@InputType()
class ImageInput {
  @Field()
  imageName: string;

  @Field()
  fileExtension: string;

  @Field()
  imageUrl: string;

  @Field()
  altText: string;

  @Field()
  size: string;

  @Field(() => Int)
  width: number;

  @Field(() => Int)
  height: number;

  @Field({ nullable: true })
  photoId?: number;
}

@InputType()
class ImageUpdateInput {
  @Field({ nullable: true })
  imageName?: string;

  @Field({ nullable: true })
  fileExtension?: string;

  @Field({ nullable: true })
  imageUrl?: string;

  @Field({ nullable: true })
  altText?: string;

  @Field({ nullable: true })
  size?: string;

  @Field(() => Int, { nullable: true })
  width?: number;

  @Field(() => Int, { nullable: true })
  height?: number;

  @Field({ nullable: true })
  photoId?: number;
}

@Resolver(() => Image)
export default class ImageResolver {
  // * Repositories
  constructor(
    @InjectRepository(Image) private imageRepository: Repository<Image>,
    @InjectRepository(Photo) private photoRepository: Repository<Photo>
  ) {}

  // * Queries
  @Query(() => [Image])
  async images(): Promise<Image[]> {
    const images = this.imageRepository.find({
      relations: ["photo"],
    });
    return images;
  }

  @Query(() => Image)
  async image(@Arg("id", () => Int) id: number): Promise<Image | undefined> {
    const image = await this.imageRepository.findOne(id, {
      relations: ["photo"],
    });
    return image;
  }

  // * Mutations
  @Authorized("ADMIN")
  @Mutation(() => Image)
  async addImage(
    @Arg("input", () => ImageInput) input: ImageInput
  ): Promise<Image | undefined> {
    const newImage = await this.imageRepository.create({ ...input });
    await this.imageRepository.save(newImage);
    return newImage;
  }

  @Authorized("ADMIN")
  @Mutation(() => Image)
  async updateImage(
    @Arg("id", () => Int) id: number,
    @Arg("input", () => ImageUpdateInput) input: ImageUpdateInput
  ): Promise<Image | undefined> {
    const image = await this.imageRepository.findOne({ id });

    if (image) {
      const updatedImage = {
        ...image,
        ...input,
      };
      return await this.imageRepository.save(updatedImage);
    } else {
      return undefined;
    }
  }

  @Authorized("ADMIN")
  @Mutation(() => Boolean)
  async deleteImage(@Arg("id", () => Int) id: number): Promise<boolean> {
    let result = true;

    const deleteResult = await this.imageRepository.delete(id);
    console.log(`delete result: ${JSON.stringify(deleteResult, null, 2)}`);
    if (!deleteResult || deleteResult.affected == 0) {
      result = false;
      throw new Error(`Failed to delete image.`);
    }
    return result;
  }

  @Authorized("ADMIN")
  @Mutation(() => Image)
  async addImageToPhoto(
    @Arg("photoId", () => Int) photoId: number,
    @Arg("imageId", () => Int) imageId: number
  ): Promise<Image | undefined> {
    const image = await this.imageRepository.findOne(imageId);
    const photo = await this.photoRepository.findOne(photoId);
    if (image !== null && image !== undefined) {
      image.photo = photo;
      const saveResult = await this.imageRepository.save(image);
      console.log(`save result: ${JSON.stringify(saveResult, null, 2)}`);
    }

    return image;
  }
}
