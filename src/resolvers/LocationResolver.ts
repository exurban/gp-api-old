import {
  Arg,
  Authorized,
  Field,
  InputType,
  Int,
  Mutation,
  Query,
  Resolver,
} from "type-graphql";
import { Repository } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";
import Location from "../entities/Location";

//* Input Types
@InputType()
class LocationInput {
  @Field()
  name: string;

  @Field()
  tag: string;
}

@InputType()
class LocationUpdateInput {
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  tag?: string;
}

@Resolver(() => Location)
export default class LocationResolver {
  //* Repositories
  constructor(
    @InjectRepository(Location)
    private locationRepository: Repository<Location>
  ) {}

  //* Queries
  @Query(() => [Location])
  async locations(): Promise<Location[]> {
    const locations = await this.locationRepository
      .createQueryBuilder("l")
      .leftJoinAndSelect("l.photos", "p")
      .leftJoinAndSelect("p.photographer", "pg")
      .leftJoinAndSelect("p.collectionsForPhoto", "pc")
      .leftJoinAndSelect("pc.collection", "c", "pc.collectionId = c.id")
      .getMany();
    console.log(`LOCATIONS: ${JSON.stringify(locations, null, 2)}`);
    return locations;
  }

  @Query(() => Location, { nullable: true })
  async location(@Arg("id", () => Int) id: number) {
    return this.locationRepository.findOne(id, {
      relations: [
        "photos",
        "photos.photographer",
        "photos.collectionsForPhoto",
      ],
    });
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
    await this.locationRepository.update(id, { ...input });
    const updatedLocation = this.locationRepository.findOne(id);
    return updatedLocation;
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
