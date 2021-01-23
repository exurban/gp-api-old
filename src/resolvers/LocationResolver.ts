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
import Location from "../entities/Location";
import Image from "../entities/Image";
import Photo from "../entities/Photo";
import { PaginatedPhotosResponse } from "../abstract/PaginatedResponse";
import GroupedResponse from "../abstract/GroupedResponse";
import { SortDirection } from "../abstract/Enum";

//* Input Types
@InputType({ description: "Inputs to create a new Location entity." })
class LocationInput {
  @Field({ description: "Name of the location." })
  name: string;

  @Field({ description: "Tag used to ID the location in Photo Info links." })
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
  description: "Optional inputs to be used to update the Location Info.",
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

@InputType()
class SearchLocationsInput {
  @Field()
  searchString: string;
}

@ObjectType()
class SearchLocationsResponse {
  @Field(() => [Location])
  datalist: Location[];
}

@InputType()
class LocationSearchSortInput {
  @Field({ nullable: true })
  filter?: string;

  @Field({ nullable: true, defaultValue: "name" })
  orderBy?: string;

  @Field(() => SortDirection, {
    nullable: true,
    defaultValue: SortDirection.ASC,
  })
  direction?: SortDirection;
}

@ObjectType()
class LocationsResponse {
  @Field(() => [Location])
  locations: Location[];
}

// * GROUPED
@InputType()
class GroupedPhotosAtLocationInput {
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  id?: number;
}

@ObjectType()
class GroupedPhotosAtLocationResponse extends GroupedResponse() {
  @Field(() => Location)
  locationInfo: Location;
}

// * PAGINATED
@InputType()
class PaginatedPhotosAtLocationInput {
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
class PaginatedPhotosAtLocationResponse extends PaginatedPhotosResponse() {
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

  @FieldResolver()
  async countOfPhotos(@Root() location: Location): Promise<number> {
    return await this.photoRepository.count({
      where: { location: location },
    });
  }

  // * Queries - Location + Cover Image Only
  @Query(() => LocationsResponse, {
    description:
      "Returns all Locations + cover images. Sortable and filterable.",
  })
  async locations(
    @Arg("input", () => LocationSearchSortInput) input: LocationSearchSortInput
  ): Promise<LocationsResponse> {
    const filter = input.filter || "";
    const orderString = `loc.${input.orderBy}` || "name";
    const dir = input.direction || SortDirection.ASC;

    const locs = await this.locationRepository
      .createQueryBuilder("loc")
      .leftJoinAndSelect("loc.coverImage", "ci")
      .where("loc.name ilike :filter", { filter: `%${filter}%` })
      .orWhere("loc.description ilike :filter", { filter: `%${filter}%` })
      .orderBy(orderString, dir)
      .getMany();

    const response = { locations: locs };
    return response;
  }

  @Query(() => SearchLocationsResponse, {
    description: "Search locations. Returns Location + Cover Image.",
  })
  async searchLocations(
    @Arg("input", () => SearchLocationsInput) input: SearchLocationsInput
  ): Promise<SearchLocationsResponse> {
    const searchString = input.searchString;

    const locs = await this.locationRepository
      .createQueryBuilder("loc")
      .leftJoinAndSelect("loc.coverImage", "ci")
      .where("loc.name ilike :searchString", {
        searchString: `%${searchString}%`,
      })
      .where("loc.tag ilike :searchString", {
        searchString: `%${searchString}%`,
      })
      .orWhere("loc.description ilike :searchString", {
        searchString: `%${searchString}%`,
      })
      .getMany();

    const response = { datalist: locs };
    return response;
  }

  @Query(() => Location, {
    nullable: true,
    description:
      "Returns one Location + portrait, only or null, if no matching id is found. Meant to be used on the backend.",
  })
  async location(
    @Arg("id", () => Int) id: number
  ): Promise<Location | undefined> {
    return this.locationRepository.findOne(id, {
      relations: ["coverImage"],
    });
  }

  @Query(() => Location, {
    nullable: true,
    description:
      "Returns one Location + portrait, only or null, if no matching name is found.",
  })
  async locationWithName(
    @Arg("name", () => String) name: string
  ): Promise<Location | undefined> {
    return this.locationRepository.findOne({
      where: { name: name },
      relations: ["coverImage"],
    });
  }

  // * Queries - GROUPED Photos At Location

  @Query(() => GroupedPhotosAtLocationResponse)
  async groupedPhotosAtLocation(
    @Arg("input", () => GroupedPhotosAtLocationInput)
    input: GroupedPhotosAtLocationInput
  ): Promise<GroupedPhotosAtLocationResponse | undefined> {
    const locationInfo = await this.locationRepository
      .createQueryBuilder("l")
      .where("l.id = :id", { id: input.id })
      .orWhere("l.name ilike :name", { name: `%${input.name}%` })
      .getOne();

    if (!locationInfo) {
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
      .where("p.location.id = :locationId", {
        locationId: locationInfo.id,
      })
      .orderBy("p.sortIndex", "DESC")
      .getMany();

    return {
      locationInfo,
      photos,
    };
  }

  // * Queries - PAGINATED Photos At Location

  @Query(() => PaginatedPhotosAtLocationResponse)
  async paginatedPhotosAtLocation(
    @Arg("input", () => PaginatedPhotosAtLocationInput)
    input: PaginatedPhotosAtLocationInput
  ): Promise<PaginatedPhotosAtLocationResponse | undefined> {
    const locationInfo = await this.locationRepository
      .createQueryBuilder("l")
      .where("l.id = :id", { id: input.id })
      .orWhere("l.name ilike :name", {
        name: `%${input.name}%`,
      })
      .getOne();

    if (!locationInfo) {
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
        .where("p.location.id = :locationId", {
          locationId: locationInfo.id,
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
        .where("p.location.id = :locationId", {
          locationId: locationInfo.id,
        })
        .andWhere("p.sortIndex < :cursor", { cursor: input.cursor })
        .orderBy("p.sortIndex", "DESC")
        .take(input.take)
        .getMany();
    }

    const total = await this.photoRepository.count({
      where: { locationId: locationInfo.id },
    });

    const pageInfo = {
      startCursor: photos[0].sortIndex,
      endCursor: photos[photos.length - 1].sortIndex,
      total: total,
    };

    return {
      locationInfo,
      pageInfo,
      photos,
    };
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
