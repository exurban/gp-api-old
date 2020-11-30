import {
  Arg,
  Authorized,
  Field,
  InputType,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from "type-graphql";
import { Repository } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";
import Location from "../entities/Location";
import Image from "../entities/Image";
import Photo from "../entities/Photo";
import PaginatedResponse from "../abstract/PaginatedResponse";

//* Input Types
@InputType({ description: "Inputs to create a new Location entity." })
class LocationInput {
  @Field()
  name: string;

  @Field()
  tag: string;

  @Field({ nullable: true, description: "Vignette describing the location." })
  description?: string;

  @Field({
    nullable: true,
    description:
      "Map of the location. Used at the top of the Location's Photo Gallery. Used to look up the Map and add it to the One-to-One relationship.",
  })
  coverImageId?: number;
}

@InputType({
  description: "Optional inputs to be used to update the Location's metadata.",
})
class LocationUpdateInput {
  @Field({ nullable: true, description: "Optional. Name of the Location." })
  name?: string;

  @Field({
    nullable: true,
    description: "Optional. Tag used to identify the Location.",
  })
  tag?: string;

  @Field({ nullable: true, description: "Vignette describing the location." })
  description?: string;

  @Field({
    nullable: true,
    description:
      "Map of the location. Used at the top of the Location's Photo Gallery. Used to look up the Map and add it to the One-to-One relationship.",
  })
  coverImageId?: number;
}

@InputType({
  description: "Input to retrieve Location and Location's Photos.",
})
class LocationNamedInput {
  @Field()
  name: string;
}

@InputType()
class AllPhotosAtLocationInput {
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
class PaginatedPhotosAtLocationResponse extends PaginatedResponse(Photo) {
  @Field(() => Location)
  locationInfo: Location;
}

@Resolver(() => Location)
export default class LocationResolver {
  //* Repositories
  constructor(
    @InjectRepository(Location)
    private locationRepository: Repository<Location>,
    @InjectRepository(Photo) private photoRepository: Repository<Photo>,
    @InjectRepository(Image) private imageRepository: Repository<Image>
  ) {}

  //* Queries

  @Query(() => PaginatedPhotosAtLocationResponse)
  async allPhotosAtLocation(
    @Arg("input", () => AllPhotosAtLocationInput)
    input: AllPhotosAtLocationInput
  ): Promise<PaginatedPhotosAtLocationResponse> {
    const lInfo = await this.locationRepository
      .createQueryBuilder("l")
      .where("l.id = :id", { id: input.id })
      .orWhere("l.name ilike :name", {
        name: `%${input.name}%`,
      })
      .getOne();

    const locationInfo = lInfo as Location;

    const allPhotosTakenAtLocation = await this.photoRepository
      .createQueryBuilder("p")
      .where("p.location.id = :locationId", {
        locationId: locationInfo.id,
      })
      .getMany();
    const total = allPhotosTakenAtLocation.length;

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
        .where("p.location.id = :locationId", {
          locationId: locationInfo.id,
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
        .where("p.location.id = :locationId", {
          locationId: locationInfo.id,
        })
        .andWhere("p.sortIndex < :cursor", { cursor: input.cursor })
        .orderBy("p.sortIndex", "DESC")
        .take(input.take)
        .getMany();
    }

    const startCursor = items[0].sortIndex;
    const endCursor = items[items.length - 1].sortIndex;

    return {
      locationInfo,
      items,
      startCursor,
      endCursor,
      total,
    };
  }

  @Query(() => [Location], {
    description:
      "Returns all Locations + maps, only. Meant to be used on the backend.",
  })
  locations(): Promise<Location[]> {
    return this.locationRepository.find({
      relations: ["coverImage"],
    });
  }

  @Query(() => Location, {
    nullable: true,
    description:
      "Returns one Location + portrait, only or null, if no matching id is found. Meant to be used on the backend.",
  })
  async location(@Arg("id", () => Int) id: number) {
    return this.locationRepository.findOne(id, {
      relations: ["coverImage"],
    });
  }

  @Query(() => Location, {
    nullable: true,
    description:
      "Returns one Location + portrait AND Location's Photos and related data, or undefined if no Location matching name provided is found. Meant to be used on the frontend. Used for the Location's Gallery.",
  })
  async locationNamed(
    @Arg("input", () => LocationNamedInput) input: LocationNamedInput
  ): Promise<Location | undefined> {
    const location = await this.locationRepository
      .createQueryBuilder("l")
      .leftJoinAndSelect("l.coverImage", "li")
      .leftJoinAndSelect("l.photos", "p")
      .leftJoinAndSelect("p.photographer", "pg")
      .leftJoinAndSelect("p.location", "lp")
      .leftJoinAndSelect("p.images", "i")
      .leftJoinAndSelect("p.subjectsInPhoto", "ps")
      .leftJoinAndSelect("ps.subject", "s", "ps.subjectId = s.id")
      .leftJoinAndSelect("p.tagsForPhoto", "pt")
      .leftJoinAndSelect("pt.tag", "t", "pt.tagId = t.id")
      .leftJoinAndSelect("p.collectionsForPhoto", "pc")
      .leftJoinAndSelect("pc.collection", "c", "pc.collectionId = c.id")
      .where("l.name ilike :name", { name: `%${input.name}%` })
      .getOne();
    return location;
  }

  //* Mutations
  @Authorized("ADMIN")
  @Mutation(() => Location)
  async addLocation(
    @Arg("input", () => LocationInput) input: LocationInput
  ): Promise<Location> {
    return await this.locationRepository.create(input).save();
  }

  @Authorized("ADMIN")
  @Mutation(() => Location, { nullable: true })
  async updateLocation(
    @Arg("id", () => Int) id: number,
    @Arg("input", () => LocationUpdateInput) input: LocationUpdateInput
  ): Promise<Location | undefined> {
    const loc = await this.locationRepository.findOne(id);
    if (!loc) {
      throw new Error(`No location with an id of ${id} exists.`);
    }
    if (input.coverImageId && loc) {
      const image = await this.imageRepository.findOne(input.coverImageId);
      loc.coverImage = image;
      await this.locationRepository.save(loc);
      delete input.coverImageId;
    }
    const updatedLocation = { ...loc, ...input };
    const l = await this.locationRepository.save(updatedLocation);

    return l;
  }

  @Authorized("ADMIN")
  @Mutation(() => Boolean)
  async deleteLocation(@Arg("id", () => Int) id: number): Promise<boolean> {
    const deleteResult = await this.locationRepository.delete({ id });
    if (deleteResult && deleteResult.affected != 0) {
      return true;
    }
    return false;
  }
}
