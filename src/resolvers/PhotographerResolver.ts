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
import PaginatedResponse from "../abstract/PaginatedResponse";

//* Input Types
@InputType({
  description: "Inputs to create a new Photographer entity.",
})
class PhotographerInput {
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

@InputType({
  description: "Input to retrieve Photographer and Photographer's Photos.",
})
class PhotographerNamedInput {
  @Field()
  name: string;
}

@InputType()
class AllPhotosByPhotographerInput {
  @Field({ nullable: true })
  firstName?: string;

  @Field({ nullable: true })
  id?: number;

  @Field(() => Int, { nullable: true })
  cursor?: number;

  @Field(() => Int)
  take: number;
}

@ObjectType()
class PaginatedPhotosByPhotographerResponse extends PaginatedResponse(Photo) {
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

  //* Queries
  @Query(() => PaginatedPhotosByPhotographerResponse)
  async allPhotosByPhotographer(
    @Arg("input", () => AllPhotosByPhotographerInput)
    input: AllPhotosByPhotographerInput
  ): Promise<PaginatedPhotosByPhotographerResponse> {
    const pgInfo = await this.photographerRepository
      .createQueryBuilder("pg")
      .where("pg.id = :id", { id: input.id })
      .orWhere("pg.firstName ilike :firstName", {
        firstName: `%${input.firstName}%`,
      })
      .getOne();

    const photographerInfo = pgInfo as Photographer;

    let items;

    if (!input.cursor) {
      items = await this.photoRepository
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
      items = await this.photoRepository
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
    const total = items.length;
    const startCursor = items[0].sortIndex;
    const endCursor = items[items.length - 1].sortIndex;

    return {
      photographerInfo,
      items,
      startCursor,
      endCursor,
      total,
    };
  }

  @Query(() => [Photographer], {
    description:
      "Returns all Photographers + portraits, only. Meant to be used on the backend.",
  })
  photographers(): Promise<Photographer[]> {
    return this.photographerRepository.find({
      relations: ["coverImage"],
    });
  }

  @Query(() => Photographer, {
    nullable: true,
    description:
      "Returns one Photographer + portrait, only or null, if no matching id is found. Meant to be used on the backend.",
  })
  async photographer(@Arg("id", () => Int) id: number) {
    return this.photographerRepository.findOne(id, {
      relations: ["coverImage"],
    });
  }

  // * photographerNamed:() - includes relationships for photo cards
  @Query(() => Photographer, {
    nullable: true,
    description:
      "Returns one Photographer + portrait AND Photographer's Photos and related data. Meant to be used on the frontend. Used for the Photographer's Gallery.",
  })
  async photographerNamed(
    @Arg("input", () => PhotographerNamedInput) input: PhotographerNamedInput
  ) {
    const [fn, ln] = input.name.split(" ");

    const photographer = await this.photographerRepository
      .createQueryBuilder("pg")
      .leftJoinAndSelect("pg.coverImage", "img")
      .leftJoinAndSelect("pg.photos", "p", "p.photographer = pg.id")
      .leftJoinAndSelect("p.location", "l")
      .leftJoinAndSelect("p.photographer", "pgp")
      .leftJoinAndSelect("p.images", "i", "i.photo_id = p.id")
      .leftJoinAndSelect("p.subjectsInPhoto", "ps")
      .leftJoinAndSelect("ps.subject", "s", "s.id = ps.subjectId")
      .leftJoinAndSelect("p.tagsForPhoto", "tp")
      .leftJoinAndSelect("tp.tag", "t", "t.id = tp.tagId")
      .leftJoinAndSelect("p.collectionsForPhoto", "pc")
      .leftJoinAndSelect("pc.collection", "c", "c.id = pc.collectionId")
      .where("pg.firstName ilike :firstName", { firstName: `%${fn}%` })
      .andWhere("pg.lastName ilike :lastName", { lastName: `%${ln}` })
      .getOne();
    return photographer;
  }

  @FieldResolver()
  name(@Root() photographer: Photographer) {
    return `${photographer.firstName} ${photographer.lastName}`;
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
