import {
  Field,
  InputType,
  Int,
  Resolver,
  Query,
  Arg,
  Authorized,
  Mutation,
  ObjectType,
} from "type-graphql";
import { Repository } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";
import Image from "../entities/Image";
import Photo from "../entities/Photo";
import SuccessMessageResponse from "../abstract/SuccessMessageResponse";

// * Input Types
@InputType()
class AddImageInput {
  @Field({ nullable: true, defaultValue: "New Image" })
  imageName: string;

  @Field({ nullable: true, defaultValue: "XL" })
  fileExtension: string;

  @Field({ nullable: true, defaultValue: "" })
  imageUrl: string;

  @Field({ nullable: true, defaultValue: "new image" })
  altText: string;

  @Field({ nullable: true, defaultValue: "XL" })
  size: string;

  @Field(() => Int, { nullable: true, defaultValue: 0 })
  width: number;

  @Field(() => Int, { nullable: true, defaultValue: 0 })
  height: number;

  @Field({ nullable: true })
  photoId?: number;
}

@InputType()
class UpdateImageInput {
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

@ObjectType()
class AddImageResponse extends SuccessMessageResponse {
  @Field(() => Image, { nullable: true })
  newImage?: Image;
}

@ObjectType()
class UpdateImageResponse extends SuccessMessageResponse {
  @Field(() => Image, { nullable: true })
  updatedImage?: Image;
}

@InputType()
class SearchImagesInput {
  @Field()
  searchString: string;
}

@ObjectType()
class SearchImagesResponse {
  @Field(() => [Image])
  datalist: Image[];
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

  @Query(() => SearchImagesResponse)
  async searchImages(
    @Arg("input", () => SearchImagesInput) input: SearchImagesInput
  ): Promise<SearchImagesResponse> {
    const searchString = input.searchString;

    const imgs = await this.imageRepository
      .createQueryBuilder("i")
      .where("i.imageName ilike :searchString", {
        searchString: `%${searchString}%`,
      })
      .getMany();

    const response = { datalist: imgs };

    return response;
  }

  // * Mutations
  @Authorized("ADMIN")
  @Mutation(() => AddImageResponse)
  async addImage(
    @Arg("input", () => AddImageInput) input: AddImageInput
  ): Promise<AddImageResponse> {
    const newImage = await this.imageRepository.create({ ...input });
    await this.imageRepository.insert(newImage);
    await this.imageRepository.save(newImage);
    return {
      success: true,
      message: `Created new image with id: ${newImage.id}`,
      newImage: newImage,
    };
  }

  @Authorized("ADMIN")
  @Mutation(() => UpdateImageResponse)
  async updateImage(
    @Arg("id", () => Int) id: number,
    @Arg("input", () => UpdateImageInput) input: UpdateImageInput
  ): Promise<UpdateImageResponse> {
    let image = await this.imageRepository.findOne({ id });

    if (!image) {
      return {
        success: false,
        message: `Failed to find image with id ${id}`,
      };
    }

    if (input.photoId) {
      const photo = await this.photoRepository.findOne(input.photoId, {
        relations: ["images"],
      });

      if (!photo) {
        return {
          success: false,
          message: `Photo ${input.photoId} not found.`,
        };
      }

      photo.images.length = 0;

      photo.images.push(image);
      await this.photoRepository.save(photo);

      console.log(JSON.stringify(photo, null, 2));

      image.photo = photo;
      delete input.photoId;
    }

    console.log(`input: ${JSON.stringify(input, null, 2)}`);
    // image.imageName = input.imageName || image.imageName;
    // image.fileExtension = input.fileExtension || image.fileExtension;
    // image.imageUrl = input.imageUrl || image.imageUrl;
    // image.altText = input.altText || image.altText;
    // image.size = input.size || image.size;
    // image.height = input.height || image.height;
    // image.width = input.width || image.width;

    image = Object.assign(image, input);

    await this.imageRepository.save(image);

    return {
      success: true,
      message: `Successfully updated image ${id}`,
      updatedImage: image,
    };
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
