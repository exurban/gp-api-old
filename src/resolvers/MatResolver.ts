import {
  Arg,
  Authorized,
  Field,
  Float,
  InputType,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from "type-graphql";
import { Repository } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";
import Mat from "../entities/Mat";
import Image from "../entities/Image";
import SuccessMessageResponse from "../abstract/SuccessMessageResponse";

//* Input Types
@InputType()
class AddMatInput {
  @Field()
  name: string;

  @Field()
  shortDescription: string;

  @Field({ nullable: true })
  description?: string;

  @Field()
  color: string;

  @Field()
  printType: string;

  @Field({ nullable: true })
  coverImageId?: number;

  @Field()
  matSku: string;

  @Field(() => Float)
  dimension1: number;

  @Field(() => Float)
  dimension2: number;

  @Field(() => Float)
  cost: number;

  @Field(() => Float)
  shippingCost: number;

  @Field(() => Float)
  basePrice: number;

  @Field(() => Float)
  priceModifier: number;
}

@InputType()
class UpdateMatInput {
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  shortDescription?: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  color?: string;

  @Field({ nullable: true })
  printType?: string;

  @Field({ nullable: true })
  coverImageId?: number;

  @Field({ nullable: true })
  matSku?: string;

  @Field(() => Float, { nullable: true })
  dimension1?: number;

  @Field(() => Float, { nullable: true })
  dimension2?: number;

  @Field(() => Float, { nullable: true })
  cost?: number;

  @Field(() => Float, { nullable: true })
  shippingCost?: number;

  @Field(() => Float, { nullable: true })
  basePrice?: number;

  @Field(() => Float, { nullable: true })
  priceModifier?: number;
}

@InputType()
class SearchMatsInput {
  @Field()
  searchString: string;
}

@ObjectType()
class SearchMatsResponse {
  @Field(() => [Mat])
  datalist: Mat[];
}

@ObjectType()
class AddMatResponse extends SuccessMessageResponse {
  @Field(() => Mat, { nullable: true })
  newMat?: Mat;
}

@ObjectType()
class UpdateMatResponse extends SuccessMessageResponse {
  @Field(() => Mat, { nullable: true })
  updatedMat?: Mat;
}

@Resolver(() => Mat)
export default class MatResolver {
  //* Repositories
  constructor(
    @InjectRepository(Mat)
    private matRepository: Repository<Mat>,
    @InjectRepository(Image)
    private imageRepository: Repository<Image>
  ) {}

  // * Queries - Print + Cover Image Only
  @Query(() => SearchMatsResponse, {
    description: "Search Mats. Returns Mat + Cover Image.",
  })
  async searchMats(
    @Arg("input", () => SearchMatsInput) input: SearchMatsInput
  ): Promise<SearchMatsResponse> {
    const searchString = input.searchString;

    const mats = await this.matRepository
      .createQueryBuilder("mat")
      .leftJoinAndSelect("mat.coverImage", "ci")
      .where("mat.name ilike :searchString", {
        searchString: `%${searchString}%`,
      })
      .where("mat.matSku ilike :searchString", {
        searchString: `%${searchString}%`,
      })
      .orWhere("mat.description ilike :searchString", {
        searchString: `%${searchString}%`,
      })
      .getMany();

    const response = { datalist: mats };
    return response;
  }

  @Query(() => [Mat])
  async matsWithAspectRatio(
    @Arg("aspectRatio", () => String) aspectRatio: string
  ): Promise<Mat[]> {
    const mats = await this.matRepository
      .createQueryBuilder("m")
      .leftJoinAndSelect("m.coverImage", "ci")
      .where("m.aspectRatio = :aspectRatio", { aspectRatio: aspectRatio })
      .getMany();
    return mats;
  }

  @Query(() => Mat)
  async mat(@Arg("id", () => Int) id: number): Promise<Mat | undefined> {
    return await this.matRepository.findOne(id, {
      relations: ["coverImage"],
    });
  }

  //* Mutations
  @Authorized("ADMIN")
  @Mutation(() => AddMatResponse)
  async addMat(
    @Arg("input", () => AddMatInput) input: AddMatInput
  ): Promise<AddMatResponse> {
    const newMat = await this.matRepository.create(input);
    if (input.coverImageId) {
      const imageId = input.coverImageId;
      const coverImage = await this.imageRepository.findOne(imageId);
      newMat.coverImage = coverImage;
    }
    await this.matRepository.insert(newMat);
    await this.matRepository.save(newMat);

    return {
      success: true,
      message: `Successfully created new Mat: ${input.name}`,
      newMat: newMat,
    };
  }

  @Authorized("ADMIN")
  @Mutation(() => UpdateMatResponse)
  async updateMat(
    @Arg("id", () => Int) id: number,
    @Arg("input", () => UpdateMatInput) input: UpdateMatInput
  ): Promise<UpdateMatResponse> {
    const mat = await this.matRepository.findOne({ id });
    if (!mat) {
      return {
        success: false,
        message: `Couldn't find mat with id: ${id}`,
      };
    }

    const updatedMat = { ...mat, ...input };
    if (input.coverImageId) {
      const imageId = input.coverImageId;
      const coverImage = await this.imageRepository.findOne(imageId);
      updatedMat.coverImage = coverImage;
    }
    const m = await this.matRepository.save(updatedMat);

    return {
      success: true,
      message: `Successfully updated ${m.name}`,
      updatedMat: m,
    };
  }

  @Authorized("ADMIN")
  @Mutation(() => Boolean)
  async deleteMat(@Arg("id", () => Int) id: number): Promise<boolean> {
    const deleteResult = await this.matRepository.delete({ id });
    if (deleteResult && deleteResult.affected != 0) {
      return true;
    }
    return false;
  }
}
