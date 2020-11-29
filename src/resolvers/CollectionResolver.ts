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
  @Query(() => [Collection])
  async collections(): Promise<Collection[]> {
    return await Collection.find();
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
