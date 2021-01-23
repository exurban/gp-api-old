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

import Collection from "../entities/Collection";
import PhotoCollection from "../entities/PhotoCollection";

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

@InputType()
class SearchCollectionsInput {
  @Field()
  searchString: string;
}

@ObjectType()
class SearchCollectionsResponse {
  @Field(() => [Collection])
  datalist: Collection[];
}

@Resolver(() => Collection)
export default class CollectionResolver {
  //* Repositories
  constructor(
    @InjectRepository(Collection)
    private collectionRepository: Repository<Collection>,
    @InjectRepository(PhotoCollection)
    private photoCollectionRepository: Repository<PhotoCollection>
  ) {}

  //* Queries
  @FieldResolver()
  async countOfPhotos(@Root() collection: Collection): Promise<number> {
    return await this.photoCollectionRepository.count({
      collectionId: collection.id,
    });
  }

  // * Queries - Location + Cover Image Only
  @Query(() => SearchCollectionsResponse, {
    description: "Search collections. Returns Collection + Cover Image.",
  })
  async searchCollections(
    @Arg("input", () => SearchCollectionsInput) input: SearchCollectionsInput
  ): Promise<SearchCollectionsResponse> {
    const searchString = input.searchString;

    const cols = await this.collectionRepository
      .createQueryBuilder("col")
      .leftJoinAndSelect("col.coverImage", "ci")
      .where("col.name ilike :searchString", {
        searchString: `%${searchString}%`,
      })
      .orWhere("col.tag ilike :searchString", {
        searchString: `%${searchString}%`,
      })
      .orWhere("col.description ilike :searchString", {
        searchString: `%${searchString}%`,
      })
      .getMany();

    const response = { datalist: cols };
    return response;
  }

  @Query(() => [Collection])
  async collectionsWithPhotos(): Promise<Collection[]> {
    return await Collection.find({
      relations: [
        "coverImage",
        "photosInCollection",
        "photosInCollection.photo",
        "photosInCollection.photo.location",
        "photosInCollection.photo.photographer",
        "photosInCollection.photo.images",
        "photosInCollection.photo.subjectsInPhoto",
        "photosInCollection.photo.subjectsInPhoto.subject",
        "photosInCollection.photo.tagsForPhoto",
        "photosInCollection.photo.tagsForPhoto.tag",
        "photosInCollection.photo.collectionsForPhoto",
        "photosInCollection.photo.collectionsForPhoto.collection",
      ],
    });
  }

  @Query(() => Collection)
  async collection(
    @Arg("id", () => Int) id: number
  ): Promise<Collection | undefined> {
    return await Collection.findOne(id, {
      relations: [
        "coverImage",
        "photosInCollection",
        "photosInCollection.photo",
        "photosInCollection.photo.location",
        "photosInCollection.photo.photographer",
        "photosInCollection.photo.images",
        "photosInCollection.photo.subjectsInPhoto",
        "photosInCollection.photo.subjectsInPhoto.subject",
        "photosInCollection.photo.tagsForPhoto",
        "photosInCollection.photo.tagsForPhoto.tag",
        "photosInCollection.photo.collectionsForPhoto",
        "photosInCollection.photo.collectionsForPhoto.collection",
      ],
    });
  }

  @Query(() => Collection)
  async collectionWithPhotos(
    @Arg("id", () => Int) id: number
  ): Promise<Collection | undefined> {
    return await Collection.findOne(id, {
      relations: [
        "coverImage",
        "photosInCollection",
        "photosInCollection.photo",
        "photosInCollection.photo.location",
        "photosInCollection.photo.photographer",
        "photosInCollection.photo.images",
        "photosInCollection.photo.subjectsInPhoto",
        "photosInCollection.photo.subjectsInPhoto.subject",
        "photosInCollection.photo.tagsForPhoto",
        "photosInCollection.photo.tagsForPhoto.tag",
        "photosInCollection.photo.collectionsForPhoto",
        "photosInCollection.photo.collectionsForPhoto.collection",
      ],
    });
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

  // ! TO DO: check for photos in collection. if so, require that they be removed from collection before it can be deleted
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
