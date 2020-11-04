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

import Collection from "../entities/Collection";

@InputType()
class CollectionInput {
  @Field()
  name: string;

  @Field()
  tag: string;

  @Field()
  description: string;
}

@InputType()
class CollectionUpdateInput {
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  tag?: string;

  @Field({ nullable: true })
  description?: string;
}

@Resolver(() => Collection)
export default class CollectionResolver {
  //* Repositories
  constructor(
    @InjectRepository(Collection)
    private collectionRepository: Repository<Collection>
  ) {}

  //* Queries
  // @Query(() => [Collection])
  // async collections(): Promise<Collection[]> {
  //   const collections = await this.collectionRepository
  //     .createQueryBuilder("c")
  //     .leftJoinAndSelect("c.photosInCollection", "pc")
  //     .leftJoinAndSelect("pc.photo", "p", "p.id = pc.photoId")
  //     .leftJoinAndSelect("p.photographer", "pg")
  //     .leftJoinAndSelect("p.location", "l")
  //     .getMany();

  //   console.log(`collections: ${JSON.stringify(collections, null, 2)}`);
  //   return collections;
  // }

  // @Query(() => [Collection])
  // async collections(): Promise<Collection[]> {
  //   const collections = await this.collectionRepository
  //     .createQueryBuilder("c")
  //     // .leftJoinAndSelect("c.photosInCollection", "pc")
  //     .leftJoinAndSelect("c.photosInCollection", "pc", "c.id = pc.collectionId")
  //     .leftJoinAndSelect("pc.photo", "p", "p.id = pc.photoId")
  //     // .leftJoinAndSelect("p.photographer", "pg")
  //     // .leftJoinAndSelect("p.location", "l")
  //     .getMany();

  //   console.log(`collections ${JSON.stringify(collections, null, 2)}`);

  //   return collections;
  // }

  @Query(() => [Collection])
  async collections(): Promise<Collection[]> {
    const collections = await Collection.find({
      relations: ["photosInCollection", "photosInCollection.photo"],
    });
    console.log(`collections: ${JSON.stringify(collections, null, 2)}`);
    return collections;
  }

  @Query(() => Collection)
  async collection(
    @Arg("id", () => Int) id: number
  ): Promise<Collection | undefined> {
    const coll = await Collection.findOne(id, {
      relations: ["photosInCollection", "photosInCollection.photo"],
    });
    console.log(`collection: ${JSON.stringify(coll, null, 2)}`);
    return coll;
  }

  //* Mutations
  @Authorized("ADMIN")
  @Mutation(() => Collection)
  async addCollection(
    @Arg("input", () => CollectionInput) input: CollectionInput
  ): Promise<Collection> {
    return await this.collectionRepository.create(input).save();
  }

  @Authorized("ADMIN")
  @Mutation(() => Collection)
  async updateCollection(
    @Arg("id", () => Int) id: number,
    @Arg("input", () => CollectionUpdateInput) input: CollectionUpdateInput
  ): Promise<Collection | undefined> {
    const collection = await this.collectionRepository.findOne(id);
    if (!collection) {
      throw new Error(`No collection with an id of ${id} exists.`);
    }
    await this.collectionRepository.update(id, {
      ...input,
    });
    const updatedCollection = await this.collectionRepository.findOne(id);

    return updatedCollection;
  }

  @Authorized("ADMIN")
  @Mutation(() => Boolean)
  async deleteCollection(@Arg("id", () => Int) id: number): Promise<boolean> {
    const deleteResult = await this.collectionRepository.delete({ id });
    if (deleteResult && deleteResult.affected != 0) {
      return true;
    }
    return false;
  }
}
