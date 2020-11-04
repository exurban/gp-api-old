import {
  Arg,
  Authorized,
  Field,
  FieldResolver,
  InputType,
  Int,
  Mutation,
  Query,
  Resolver,
  Root,
} from "type-graphql";
import { Repository } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";
import Photographer from "../entities/Photographer";

//* Input Types
@InputType()
class PhotographerInput {
  @Field()
  firstName: string;

  @Field()
  lastName: string;

  @Field()
  email: string;

  @Field(() => String)
  bio: string;

  @Field()
  photoUrl: string;
}

@InputType()
class PhotographerUpdateInput {
  @Field({ nullable: true })
  firstName?: string;

  @Field({ nullable: true })
  lastName?: string;

  @Field({ nullable: true })
  email?: string;

  @Field(() => String, { nullable: true })
  bio?: string;

  @Field({ nullable: true })
  photoUrl?: string;
}

@Resolver(() => Photographer)
export default class PhotographerResolver {
  //* Repositories
  constructor(
    @InjectRepository(Photographer)
    private photographerRepository: Repository<Photographer>
  ) {}

  //* Queries
  @Query(() => [Photographer])
  photographers(): Promise<Photographer[]> {
    return this.photographerRepository.find({
      relations: ["photos", "photos.location", "photos.collectionsForPhoto"],
    });
  }

  @Query(() => Photographer, { nullable: true })
  async photographer(@Arg("id", () => Int) id: number) {
    return this.photographerRepository.findOne(id, {
      relations: ["photos", "photos.location", "photos.collectionsForPhoto"],
    });
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
    await this.photographerRepository.update(id, { ...input });
    const updatedPhotographer = await this.photographerRepository.findOne(id);

    return updatedPhotographer;
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
