import {
  Arg,
  Authorized,
  Field,
  FieldResolver,
  Float,
  InputType,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  Root,
} from "type-graphql";
import { Repository } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";
import Print from "../entities/Print";
import Image from "../entities/Image";
import PhotoPrint from "../entities/PhotoPrint";
import SuccessMessageResponse from "../abstract/SuccessMessageResponse";

//* Input Types
@InputType()
class AddPrintInput {
  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field()
  type: string;

  @Field({ nullable: true })
  coverImageId?: number;

  @Field()
  printSku: string;

  @Field()
  aspectRatio: string;

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
class UpdatePrintInput {
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  type?: string;

  @Field({ nullable: true })
  coverImageId?: number;

  @Field({ nullable: true })
  printSku?: string;

  @Field({ nullable: true })
  aspectRatio?: string;

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
class SearchPrintsInput {
  @Field()
  searchString: string;
}

@ObjectType()
class SearchPrintsResponse {
  @Field(() => [Print])
  datalist: Print[];
}

@ObjectType()
class AddPrintResponse extends SuccessMessageResponse {
  @Field(() => Print, { nullable: true })
  newPrint?: Print;
}

@ObjectType()
class UpdatePrintResponse extends SuccessMessageResponse {
  @Field(() => Print, { nullable: true })
  updatedPrint?: Print;
}

@Resolver(() => Print)
export default class PrintResolver {
  //* Repositories
  constructor(
    @InjectRepository(Print)
    private printRepository: Repository<Print>,
    @InjectRepository(PhotoPrint)
    private photoPrintRepository: Repository<PhotoPrint>,
    @InjectRepository(Image)
    private imageRepository: Repository<Image>
  ) {}

  // * Field Resolvers
  @FieldResolver()
  async countOfPhotos(@Root() print: Print): Promise<number> {
    return await this.photoPrintRepository.count({
      printId: print.id,
    });
  }

  @FieldResolver(() => String)
  finishSku(@Root() print: Print) {
    return `${print.printSku}-${print.dimension1}x${print.dimension2}`;
  }

  // * Queries - Print + Cover Image Only
  @Query(() => SearchPrintsResponse, {
    description: "Search Prints. Returns Print + Cover Image.",
  })
  async searchPrints(
    @Arg("input", () => SearchPrintsInput) input: SearchPrintsInput
  ): Promise<SearchPrintsResponse> {
    const searchString = input.searchString;

    const prints = await this.printRepository
      .createQueryBuilder("fin")
      .leftJoinAndSelect("fin.coverImage", "ci")
      .where("fin.name ilike :searchString", {
        searchString: `%${searchString}%`,
      })
      .where("fin.finSku ilike :searchString", {
        searchString: `%${searchString}%`,
      })
      .orWhere("fin.description ilike :searchString", {
        searchString: `%${searchString}%`,
      })
      .getMany();

    const response = { datalist: prints };
    return response;
  }

  @Query(() => Print)
  async finish(@Arg("id", () => Int) id: number): Promise<Print | undefined> {
    return await this.printRepository.findOne(id, {
      relations: ["coverImage"],
    });
  }

  //* Mutations
  @Authorized("ADMIN")
  @Mutation(() => AddPrintResponse)
  async addPrint(
    @Arg("input", () => AddPrintInput) input: AddPrintInput
  ): Promise<AddPrintResponse> {
    const newPrint = await this.printRepository.create(input);
    if (input.coverImageId) {
      const imageId = input.coverImageId;
      const coverImage = await this.imageRepository.findOne(imageId);
      newPrint.coverImage = coverImage;
    }
    await this.printRepository.insert(newPrint);
    await this.printRepository.save(newPrint);

    return {
      success: true,
      message: `Successfully created new Print: ${input.name}`,
      newPrint: newPrint,
    };
  }

  @Authorized("ADMIN")
  @Mutation(() => UpdatePrintResponse)
  async updatePrint(
    @Arg("id", () => Int) id: number,
    @Arg("input", () => UpdatePrintInput) input: UpdatePrintInput
  ): Promise<UpdatePrintResponse> {
    const print = await this.printRepository.findOne({ id });
    if (!print) {
      return {
        success: false,
        message: `Couldn't find print with id: ${id}`,
      };
    }

    const updatedPrint = { ...print, ...input };
    if (input.coverImageId) {
      const imageId = input.coverImageId;
      const coverImage = await this.imageRepository.findOne(imageId);
      updatedPrint.coverImage = coverImage;
    }
    const pr = await this.printRepository.save(updatedPrint);

    return {
      success: true,
      message: `Successfully updated ${pr.name}`,
      updatedPrint: pr,
    };
  }

  @Authorized("ADMIN")
  @Mutation(() => Boolean)
  async deletePrint(@Arg("id", () => Int) id: number): Promise<boolean> {
    const deleteResult = await this.printRepository.delete({ id });
    if (deleteResult && deleteResult.affected != 0) {
      return true;
    }
    return false;
  }
}
