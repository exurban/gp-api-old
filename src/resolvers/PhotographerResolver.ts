import {
  Arg,
  Authorized,
  Field,
  FieldResolver,
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
import Photographer from "../entities/Photographer";
import Image from "../entities/Image";
import Photo from "../entities/Photo";
import { PaginatedPhotosResponse } from "../abstract/PaginatedResponse";
import GroupedResponse from "../abstract/GroupedResponse";

//* Input Types
@InputType({
  description: "Inputs to create a new Photographer entity.",
})
class PhotographerInput {
  @Field({ description: "Photographer's full name." })
  name: string;

  @Field({ description: "Photographer's first name." })
  firstName: string;

  @Field({ description: "Photographer's last name." })
  lastName: string;

  @Field({ description: "Photographer's email address." })
  email: string;

  @Field(() => String, {
    description:
      "Short biography for Photographer. Displayed at the top of the Photographer's photo gallery.",
  })
  bio: string;

  @Field({
    nullable: true,
    description: "ID of the image for the Photographer's portrait.",
  })
  coverImageId?: number;
}

@InputType({
  description: "Inputs to update a Photographer entity.",
})
class PhotographerUpdateInput {
  @Field({
    nullable: true,
    description: "Optional: Photographer's full name.",
  })
  name?: string;

  @Field({
    nullable: true,
    description: "Optional: Photographer's first name.",
  })
  firstName?: string;

  @Field({ nullable: true, description: "Optional: Photographer's last name." })
  lastName?: string;

  @Field({
    nullable: true,
    description: "Optional: Photographer's email address.",
  })
  email?: string;

  @Field(() => String, {
    nullable: true,
    description:
      "Optional: Short biography for Photographer. Displayed at the top of the Photographer's photo gallery.",
  })
  bio?: string;

  @Field({
    nullable: true,
    description: "Inputs to update a Photographer entity.",
  })
  coverImageId?: number;
}

@InputType()
class SearchPhotographersInput {
  @Field()
  searchString: string;
}

@ObjectType()
class SearchPhotographersResponse {
  @Field(() => [Photographer])
  datalist: Photographer[];
}

@ObjectType()
class PhotographersResponse {
  @Field(() => [Photographer])
  photographers: Photographer[];
}

// * GROUPED
@InputType()
class GroupedPhotosByPhotographerInput {
  @Field({ nullable: true })
  id?: number;

  @Field({ nullable: true })
  name?: string;
}

@ObjectType()
class GroupedPhotosByPhotographerResponse extends GroupedResponse() {
  @Field(() => Photographer)
  photographerInfo: Photographer;
}

// * PAGINATED
@InputType()
class PaginatedPhotosByPhotographerInput {
  @Field({ nullable: true })
  id?: number;

  @Field({ nullable: true })
  name?: string;

  @Field(() => Int, { nullable: true })
  cursor?: number;

  @Field(() => Int)
  take: number;
}

@ObjectType()
class PaginatedPhotosByPhotographerResponse extends PaginatedPhotosResponse() {
  @Field(() => Photographer)
  photographerInfo: Photographer;
}

@Resolver(() => Photographer)
export default class PhotographerResolver {
  //* Repositories
  constructor(
    @InjectRepository(Photographer)
    private photographerRepository: Repository<Photographer>,
    @InjectRepository(Photo) private photoRepository: Repository<Photo>,
    @InjectRepository(Image) private imageRepository: Repository<Image>
  ) {}

  @FieldResolver()
  async countOfPhotos(@Root() photographer: Photographer): Promise<number> {
    return await this.photoRepository.count({
      where: { photographer: photographer },
    });
  }

  // * Queries - Photographer + Image Only
  @Query(() => SearchPhotographersResponse, {
    description:
      "Returns all Photographers + portraits, only. Meant to be used on the backend.",
  })
  async searchPhotographers(
    @Arg("input", () => SearchPhotographersInput)
    input: SearchPhotographersInput
  ): Promise<SearchPhotographersResponse> {
    const searchString = input.searchString;

    const pg = await this.photographerRepository
      .createQueryBuilder("pg")
      .leftJoinAndSelect("pg.coverImage", "ci")
      .where("pg.name ilike :searchString", {
        searchString: `%${searchString}%`,
      })
      .orWhere("pg.email ilike :searchString", {
        searchString: `%${searchString}%`,
      })
      .orWhere("pg.bio ilike :searchString", {
        searchString: `%${searchString}%`,
      })
      .getMany();

    const resp = { datalist: pg };
    return resp;
  }

  @Query(() => PhotographersResponse, {
    description:
      "Returns all Photographers + portraits, only. Meant to be used on the backend.",
  })
  async sortedPhotographers(
    @Arg("filter", () => String) filter: string,
    @Arg("orderBy", () => String) orderBy: string,
    @Arg("asc", () => Boolean) asc: boolean
  ): Promise<PhotographersResponse> {
    const dir = asc ? "ASC" : "DESC";
    const orderString = `pg.${orderBy}`;
    console.log(`ORDER BY: ${orderString}\nFILTER:${filter}`);

    const pg = await this.photographerRepository
      .createQueryBuilder("pg")
      .leftJoinAndSelect("pg.coverImage", "ci")
      .where("pg.name ilike :filter", { filter: `%${filter}%` })
      .orWhere("pg.email ilike :filter", { filter: `%${filter}%` })
      .orWhere("pg.bio ilike :filter", { filter: `%${filter}%` })
      .orderBy(orderString, dir)
      .getMany();

    const resp = { photographers: pg };
    return resp;
  }

  @Query(() => Photographer, {
    nullable: true,
    description:
      "Returns one Photographer + portrait, only or null, if no matching id is found. Meant to be used on the backend.",
  })
  async photographer(@Arg("id", () => Int) id: number) {
    console.log(`fetching photographer.`);
    return this.photographerRepository.findOne(id, {
      relations: ["coverImage"],
    });
  }

  // * photographerWithName:()
  @Query(() => Photographer, {
    nullable: true,
    description:
      "Returns one Photographer + portrait AND Photographer's Photos and related data. Meant to be used on the frontend. Used for the Photographer's Gallery.",
  })
  async photographerWithName(@Arg("name", () => String) name: string) {
    const photographer = await this.photographerRepository
      .createQueryBuilder("pg")
      .leftJoinAndSelect("pg.coverImage", "img")
      .where("pg.name ilike :name", { name: `%${name}%` })
      .getOne();
    return photographer;
  }

  // * Queries - GROUPED
  @Query(() => GroupedPhotosByPhotographerResponse)
  async groupedPhotosByPhotographer(
    @Arg("input", () => GroupedPhotosByPhotographerInput)
    input: GroupedPhotosByPhotographerInput
  ): Promise<GroupedPhotosByPhotographerResponse | undefined> {
    const photographerInfo = await this.photographerRepository
      .createQueryBuilder("pg")
      .orWhere("pg.name ilike :name", { name: `%${input.name}%` })
      .orWhere("pg.id = :id", { id: input.id })
      .getOne();

    if (!photographerInfo) {
      return undefined;
    }

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
      .where("p.photographer.id = :photographerId", {
        photographerId: photographerInfo.id,
      })
      .orderBy("p.sortIndex", "DESC")
      .getMany();

    return {
      photographerInfo,
      photos,
    };
  }

  // * Queries - PAGINATED

  @Query(() => PaginatedPhotosByPhotographerResponse)
  async paginatedPhotosByPhotographer(
    @Arg("input", () => PaginatedPhotosByPhotographerInput)
    input: PaginatedPhotosByPhotographerInput
  ): Promise<PaginatedPhotosByPhotographerResponse | undefined> {
    const photographerInfo = await this.photographerRepository
      .createQueryBuilder("pg")
      .where("pg.name ilike :name", {
        name: `%${input.name}%`,
      })
      .orWhere("pg.id = :id", { id: input.id })
      .getOne();

    if (!photographerInfo) {
      return undefined;
    }
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
        .where("p.photographer.id = :photographerId", {
          photographerId: photographerInfo.id,
        })
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
        .where("p.photographer.id = :photographerId", {
          photographerId: photographerInfo?.id,
        })
        .andWhere("p.sortIndex < :cursor", { cursor: input.cursor })
        .orderBy("p.sortIndex", "DESC")
        .take(input.take)
        .getMany();
    }
    const allByPhotographer = await this.photoRepository.find({
      where: { photographerId: photographerInfo.id },
    });

    const pageInfo = {
      startCursor: photos[0].sortIndex,
      endCursor: photos[photos.length - 1].sortIndex,
      total: allByPhotographer.length,
    };
    return {
      photographerInfo,
      pageInfo,
      photos,
    };
  }

  //* Mutations
  @Authorized("ADMIN")
  @Mutation(() => Photographer)
  async addPhotographer(
    @Arg("input", () => PhotographerInput) input: PhotographerInput
  ): Promise<Photographer> {
    return await this.photographerRepository.create(input).save();
  }

  @Authorized("ADMIN")
  @Mutation(() => Photographer, { nullable: true })
  async updatePhotographer(
    @Arg("id", () => Int) id: number,
    @Arg("input", () => PhotographerUpdateInput) input: PhotographerUpdateInput
  ): Promise<Photographer | undefined> {
    const photographer = await this.photographerRepository.findOne({ id });
    if (!photographer) {
      throw new Error(`No photographer with an id of ${id} exists.`);
    }
    if (input.coverImageId && photographer) {
      const image = await this.imageRepository.findOne(input.coverImageId);
      photographer.coverImage = image;
      await this.photographerRepository.save(photographer);
      delete input.coverImageId;
    }
    const updatedPhotographer = { ...photographer, ...input };
    const pg = await this.photographerRepository.save(updatedPhotographer);

    return pg;
  }

  @Authorized("ADMIN")
  @Mutation(() => Boolean)
  async deletePhotographer(@Arg("id", () => Int) id: number): Promise<boolean> {
    const deleteResult = await this.photographerRepository.delete({ id });
    if (deleteResult && deleteResult.affected != 0) {
      return true;
    }
    return false;
  }
}
