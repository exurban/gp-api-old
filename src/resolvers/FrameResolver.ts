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
import Frame from "../entities/Frame";
import Image from "../entities/Image";
import SuccessMessageResponse from "../abstract/SuccessMessageResponse";

//* Input Types
@InputType()
class AddFrameInput {
  @Field()
  name: string;

  @Field()
  displayName: string;

  @Field({ nullable: true })
  description?: string;

  @Field()
  material: string;

  @Field()
  color: string;

  @Field({ nullable: true })
  sortIndex?: number;

  @Field()
  printType: string;

  @Field({ nullable: true })
  coverImageId?: number;

  @Field()
  frameSku: string;

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
class UpdateFrameInput {
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  displayName?: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  material?: string;

  @Field({ nullable: true })
  color?: string;

  @Field({ nullable: true })
  printType?: string;

  @Field({ nullable: true })
  sortIndex?: number;

  @Field({ nullable: true })
  coverImageId?: number;

  @Field({ nullable: true })
  frameSku?: string;

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
class SearchFramesInput {
  @Field()
  searchString: string;
}

@ObjectType()
class SearchFramesResponse {
  @Field(() => [Frame])
  datalist: Frame[];
}

@ObjectType()
class AddFrameResponse extends SuccessMessageResponse {
  @Field(() => Frame, { nullable: true })
  newFrame?: Frame;
}

@ObjectType()
class UpdateFrameResponse extends SuccessMessageResponse {
  @Field(() => Frame, { nullable: true })
  updatedFrame?: Frame;
}

@Resolver(() => Frame)
export default class FrameResolver {
  //* Repositories
  constructor(
    @InjectRepository(Frame)
    private frameRepository: Repository<Frame>,
    @InjectRepository(Image)
    private imageRepository: Repository<Image>
  ) {}

  @FieldResolver()
  retailPrice(@Root() frame: Frame) {
    return frame.basePrice * frame.priceModifier;
  }

  // * Queries - Print + Cover Image Only
  @Query(() => SearchFramesResponse, {
    description: "Search Frames. Returns Frame + Cover Image.",
  })
  async searchFrames(
    @Arg("input", () => SearchFramesInput) input: SearchFramesInput
  ): Promise<SearchFramesResponse> {
    const searchString = input.searchString;

    const frames = await this.frameRepository
      .createQueryBuilder("fr")
      .leftJoinAndSelect("fr.coverImage", "ci")
      .where("fr.name ilike :searchString", {
        searchString: `%${searchString}%`,
      })
      .where("fr.frameSku ilike :searchString", {
        searchString: `%${searchString}%`,
      })
      .orWhere("fr.description ilike :searchString", {
        searchString: `%${searchString}%`,
      })
      .getMany();

    const response = { datalist: frames };
    return response;
  }

  @Query(() => [Frame])
  async framesWithAspectRatio(
    @Arg("aspectRatio", () => String) aspectRatio: string
  ): Promise<Frame[]> {
    const frames = await this.frameRepository
      .createQueryBuilder("fr")
      .leftJoinAndSelect("fr.coverImage", "ci")
      .where("fr.aspectRatio = :aspectRatio", { aspectRatio: aspectRatio })
      .getMany();
    return frames;
  }

  @Query(() => Frame)
  async frame(@Arg("id", () => Int) id: number): Promise<Frame | undefined> {
    return await this.frameRepository.findOne(id, {
      relations: ["coverImage"],
    });
  }

  //* Mutations
  @Authorized("ADMIN")
  @Mutation(() => AddFrameResponse)
  async addFrame(
    @Arg("input", () => AddFrameInput) input: AddFrameInput
  ): Promise<AddFrameResponse> {
    const newFrame = await this.frameRepository.create(input);
    if (input.coverImageId) {
      const imageId = input.coverImageId;
      const coverImage = await this.imageRepository.findOne(imageId);
      newFrame.coverImage = coverImage;
    }
    await this.frameRepository.insert(newFrame);
    await this.frameRepository.save(newFrame);

    return {
      success: true,
      message: `Successfully created new Frame: ${input.name}`,
      newFrame: newFrame,
    };
  }

  @Authorized("ADMIN")
  @Mutation(() => UpdateFrameResponse)
  async updateFrame(
    @Arg("id", () => Int) id: number,
    @Arg("input", () => UpdateFrameInput) input: UpdateFrameInput
  ): Promise<UpdateFrameResponse> {
    const frame = await this.frameRepository.findOne({ id });
    if (!frame) {
      return {
        success: false,
        message: `Couldn't find frame with id: ${id}`,
      };
    }

    const updatedFrame = { ...frame, ...input };
    if (input.coverImageId) {
      const imageId = input.coverImageId;
      const coverImage = await this.imageRepository.findOne(imageId);
      updatedFrame.coverImage = coverImage;
    }
    const fr = await this.frameRepository.save(updatedFrame);

    return {
      success: true,
      message: `Successfully updated ${fr.name}`,
      updatedFrame: fr,
    };
  }

  @Authorized("ADMIN")
  @Mutation(() => Boolean)
  async deleteFrame(@Arg("id", () => Int) id: number): Promise<boolean> {
    const deleteResult = await this.frameRepository.delete({ id });
    if (deleteResult && deleteResult.affected != 0) {
      return true;
    }
    return false;
  }
}
