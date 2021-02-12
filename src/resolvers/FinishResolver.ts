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
import Finish from "../entities/Finish";
import Photo from "../entities/Photo";
import Image from "../entities/Image";
import PhotoFinish from "../entities/PhotoFinish";
import { PaginatedPhotosResponse } from "../abstract/PaginatedResponse";
import GroupedResponse from "../abstract/GroupedResponse";
import SuccessMessageResponse from "../abstract/SuccessMessageResponse";

//* Input Types
@InputType()
class AddFinishInput {
  @Field()
  name: string;

  @Field()
  description: string;

  @Field({ nullable: true })
  coverImageId?: number;

  @Field()
  finSku: string;

  @Field(() => Float)
  width: number;

  @Field(() => Float)
  height: number;

  @Field(() => Float)
  depth: number;

  @Field(() => Float)
  weight: number;

  @Field(() => Float)
  shippingWeight: number;

  @Field(() => Float)
  basePrice: number;

  @Field(() => Float)
  priceModifier: number;
}

@InputType()
class UpdateFinishInput {
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  coverImageId?: number;

  @Field({ nullable: true })
  finSku?: string;

  @Field(() => Float, { nullable: true })
  width?: number;

  @Field(() => Float, { nullable: true })
  height?: number;

  @Field(() => Float, { nullable: true })
  depth?: number;

  @Field(() => Float, { nullable: true })
  weight?: number;

  @Field(() => Float, { nullable: true })
  shippingWeight?: number;

  @Field(() => Float, { nullable: true })
  basePrice?: number;

  @Field(() => Float, { nullable: true })
  priceModifier?: number;
}

@InputType()
class SearchFinishesInput {
  @Field()
  searchString: string;
}

@ObjectType()
class SearchFinishesResponse {
  @Field(() => [Finish])
  datalist: Finish[];
}

// * GROUPED
@InputType()
class GroupedPhotosWithFinishInput {
  @Field({ nullable: true })
  id?: number;

  @Field({ nullable: true })
  name?: string;
}

@ObjectType()
class GroupedPhotosWithFinishResponse extends GroupedResponse() {
  @Field(() => Finish)
  finishInfo: Finish;
}

// * PAGINATED
@InputType()
class PaginatedPhotosWithFinishInput {
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  id?: number;

  @Field(() => Int, { nullable: true })
  cursor?: number;

  @Field(() => Int)
  take: number;
}

@ObjectType()
class PaginatedPhotosWithFinishResponse extends PaginatedPhotosResponse() {
  @Field(() => Finish)
  finishInfo: Finish;
}

@ObjectType()
class AddFinishResponse extends SuccessMessageResponse {
  @Field(() => Finish, { nullable: true })
  newFinish?: Finish;
}

@ObjectType()
class UpdateFinishResponse extends SuccessMessageResponse {
  @Field(() => Finish, { nullable: true })
  updatedFinish?: Finish;
}

@Resolver(() => Finish)
export default class FinishResolver {
  //* Repositories
  constructor(
    @InjectRepository(Finish)
    private finishRepository: Repository<Finish>,
    @InjectRepository(PhotoFinish)
    private photoFinishRepository: Repository<PhotoFinish>,
    @InjectRepository(Photo)
    private photoRepository: Repository<Photo>,
    @InjectRepository(Image)
    private imageRepository: Repository<Image>
  ) {}

  // * Field Resolvers
  @FieldResolver()
  async countOfPhotos(@Root() finish: Finish): Promise<number> {
    return await this.photoFinishRepository.count({
      finishId: finish.id,
    });
  }

  @FieldResolver(() => String)
  finishSku(@Root() finish: Finish) {
    return `${finish.finSku}-${finish.height}x${finish.width}`;
  }

  // * Queries - Finish + Cover Image Only
  @Query(() => SearchFinishesResponse, {
    description: "Search Finishes. Returns Finish + Cover Image.",
  })
  async searchFinishes(
    @Arg("input", () => SearchFinishesInput) input: SearchFinishesInput
  ): Promise<SearchFinishesResponse> {
    const searchString = input.searchString;

    const finishes = await this.finishRepository
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

    const response = { datalist: finishes };
    return response;
  }

  @Query(() => Finish)
  async finish(@Arg("id", () => Int) id: number): Promise<Finish | undefined> {
    return await this.finishRepository.findOne(id, {
      relations: ["coverImage"],
    });
  }

  // * Queries = GROUPED Photos with Finish
  @Query(() => GroupedPhotosWithFinishResponse)
  async groupedPhotosWithFinish(
    @Arg("input", () => GroupedPhotosWithFinishInput)
    input: GroupedPhotosWithFinishInput
  ): Promise<GroupedPhotosWithFinishResponse | undefined> {
    const finishInfo = await this.finishRepository
      .createQueryBuilder("f")
      .where("f.id = :id", { id: input.id })
      .orWhere("f.name ilike :name", { name: `%${input.name}%` })
      .getOne();

    if (!finishInfo) {
      return undefined;
    }

    const photosWithFinish = await this.photoFinishRepository.find({
      where: { finishId: finishInfo.id },
    });
    const photoIds = photosWithFinish.map((pf) => pf.photoId);

    const photos = await this.photoRepository
      .createQueryBuilder("p")
      .leftJoinAndSelect("p.location", "l")
      .leftJoinAndSelect("p.photographer", "pg")
      .leftJoinAndSelect("p.images", "i")
      .leftJoinAndSelect("p.subjectsInPhoto", "ps")
      .leftJoinAndSelect("ps.subject", "s", "s.id = ps.subjectId")
      .leftJoinAndSelect("p.tagsForPhoto", "pt")
      .leftJoinAndSelect("pt.tag", "t", "t.id = pt.tagId")
      .leftJoinAndSelect("p.collectionsForPhoto", "pc")
      .leftJoinAndSelect("pc.collection", "c", "c.id = pc.collectionId")
      .leftJoinAndSelect("p.finishesForPhoto", "pf")
      .leftJoinAndSelect("pc.finish", "f", "f.id = pf.finishId")
      .where("p.id IN (:...photoIds)", { photoIds: photoIds })
      .orderBy("p.sortIndex", "DESC")
      .getMany();

    return {
      finishInfo,
      photos,
    };
  }

  // * Queries - PAGINATED Photos with Finish
  @Query(() => PaginatedPhotosWithFinishResponse)
  async paginatedPhotosWithFinish(
    @Arg("input", () => PaginatedPhotosWithFinishInput)
    input: PaginatedPhotosWithFinishInput
  ): Promise<PaginatedPhotosWithFinishResponse | undefined> {
    const finishInfo = await this.finishRepository.findOne({
      where: { name: input.name },
    });

    if (!finishInfo) {
      return undefined;
    }

    const photosWithFinish = await this.photoFinishRepository.find({
      where: { finishId: finishInfo.id },
    });
    const photoIds = photosWithFinish.map((pf) => pf.photoId);

    const total = photoIds.length;

    let photos;

    if (!input.cursor) {
      photos = await this.photoRepository
        .createQueryBuilder("p")
        .leftJoinAndSelect("p.location", "l")
        .leftJoinAndSelect("p.photographer", "pg")
        .leftJoinAndSelect("p.images", "i")
        .leftJoinAndSelect("p.subjectsInPhoto", "ps")
        .leftJoinAndSelect("ps.subject", "s", "s.id = ps.subjectId")
        .leftJoinAndSelect("p.tagsForPhoto", "pt")
        .leftJoinAndSelect("pt.tag", "t", "t.id = pt.tagId")
        .leftJoinAndSelect("p.collectionsForPhoto", "pc")
        .leftJoinAndSelect("pc.collection", "c", "c.id = pc.collectionId")
        .leftJoinAndSelect("p.finishesForPhoto", "pf")
        .leftJoinAndSelect("pc.finish", "f", "f.id = pf.finishId")
        .where("p.id IN (:...photoIds)", { photoIds: photoIds })
        .orderBy("p.sortIndex", "DESC")
        .take(input.take)
        .getMany();
    } else {
      photos = await this.photoRepository
        .createQueryBuilder("p")
        .leftJoinAndSelect("p.location", "l")
        .leftJoinAndSelect("p.photographer", "pg")
        .leftJoinAndSelect("p.images", "i")
        .leftJoinAndSelect("p.subjectsInPhoto", "ps")
        .leftJoinAndSelect("ps.subject", "s", "s.id = ps.subjectId")
        .leftJoinAndSelect("p.tagsForPhoto", "pt")
        .leftJoinAndSelect("pt.tag", "t", "t.id = pt.tagId")
        .leftJoinAndSelect("p.collectionsForPhoto", "pc")
        .leftJoinAndSelect("pc.collection", "c", "c.id = pc.collectionId")
        .leftJoinAndSelect("p.finishesForPhoto", "pf")
        .leftJoinAndSelect("pc.finish", "f", "f.id = pf.finishId")
        .where("p.id IN (:...photoIds)", { photoIds: photoIds })
        .andWhere("p.sortIndex < :cursor", { cursor: input.cursor })
        .orderBy("p.sortIndex", "DESC")
        .take(input.take)
        .getMany();
    }

    const pageInfo = {
      startCursor: photos[0].sortIndex,
      endCursor: photos[photos.length - 1].sortIndex,
      total: total,
    };

    console.log(`returning ${photos.length} of ${pageInfo.total} photos.`);

    return {
      finishInfo,
      pageInfo,
      photos,
    };
  }

  //* Mutations
  @Authorized("ADMIN")
  @Mutation(() => AddFinishResponse)
  async addFinish(
    @Arg("input", () => AddFinishInput) input: AddFinishInput
  ): Promise<AddFinishResponse> {
    const newFinish = await this.finishRepository.create(input);
    if (input.coverImageId) {
      const imageId = input.coverImageId;
      const coverImage = await this.imageRepository.findOne(imageId);
      newFinish.coverImage = coverImage;
    }
    await this.finishRepository.insert(newFinish);
    await this.finishRepository.save(newFinish);

    return {
      success: true,
      message: `Successfully created new Finish: ${input.name}`,
      newFinish: newFinish,
    };
  }

  @Authorized("ADMIN")
  @Mutation(() => UpdateFinishResponse)
  async updateFinish(
    @Arg("id", () => Int) id: number,
    @Arg("input", () => UpdateFinishInput) input: UpdateFinishInput
  ): Promise<UpdateFinishResponse> {
    const finish = await this.finishRepository.findOne({ id });
    if (!finish) {
      return {
        success: false,
        message: `Couldn't find finish with id: ${id}`,
      };
    }

    const updatedFinish = { ...finish, ...input };
    if (input.coverImageId) {
      const imageId = input.coverImageId;
      const coverImage = await this.imageRepository.findOne(imageId);
      updatedFinish.coverImage = coverImage;
    }
    const fin = await this.finishRepository.save(updatedFinish);

    return {
      success: true,
      message: `Successfully updated ${fin.name}`,
      updatedFinish: fin,
    };
  }

  @Authorized("ADMIN")
  @Mutation(() => Boolean)
  async deleteFinish(@Arg("id", () => Int) id: number): Promise<boolean> {
    const deleteResult = await this.finishRepository.delete({ id });
    if (deleteResult && deleteResult.affected != 0) {
      return true;
    }
    return false;
  }
}
