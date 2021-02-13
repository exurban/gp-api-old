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
import Photo from "../entities/Photo";
import Image from "../entities/Image";
import SuccessMessageResponse from "../abstract/SuccessMessageResponse";

//* Input Type
@InputType({
  description: "Inputs to create a new Collection.",
})
class AddCollectionInput {
  @Field({
    description: "Name of the collection. Used in Photo Info links.",
  })
  name: string;

  @Field()
  tag: string;

  @Field({
    description: "A vignette used to introduce the subject.",
  })
  description: string;

  @Field(() => Int, {
    nullable: true,
    description: "A cover image to be displayed next to the opening vignette.",
  })
  coverImageId?: number;
}

@InputType({
  description: "Optional inputs to be used to update the Collection Info.",
})
class UpdateCollectionInput {
  @Field({
    nullable: true,
    description: "Optional. Name of the collection. Used in Photo Info links.",
  })
  name?: string;

  @Field({
    nullable: true,
    description: "An optional tag for the collection.",
  })
  tag?: string;

  @Field({
    nullable: true,
    description: "Optional. A vignette used to introduce the subject.",
  })
  description?: string;

  @Field({
    nullable: true,
    description:
      "Optional. A cover image to be displayed next to the opening vignette.",
  })
  coverImageId?: number;
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

@ObjectType()
class AddCollectionResponse extends SuccessMessageResponse {
  @Field(() => Collection, { nullable: true })
  newCollection?: Collection;
}

@ObjectType()
class UpdateCollectionResponse extends SuccessMessageResponse {
  @Field(() => Collection, { nullable: true })
  updatedCollection?: Collection;
}

// * ALL
@InputType()
class AllPhotosInCollectionInput {
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  id?: number;
}

@ObjectType()
class AllPhotosInCollectionResponse {
  @Field(() => Collection)
  collectionInfo: Collection;

  @Field(() => Int)
  total: number;

  @Field(() => [Photo])
  photos: Photo[];
}

@Resolver(() => Collection)
export default class CollectionResolver {
  //* Repositories
  constructor(
    @InjectRepository(Collection)
    private collectionRepository: Repository<Collection>,
    @InjectRepository(PhotoCollection)
    private photoCollectionRepository: Repository<PhotoCollection>,
    @InjectRepository(Photo) private photoRepository: Repository<Photo>,
    @InjectRepository(Image) private imageRepository: Repository<Image>
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

  // * Queries - ALL Photos In Collection

  @Query(() => AllPhotosInCollectionResponse)
  async allPhotosInCollection(
    @Arg("input", () => AllPhotosInCollectionInput)
    input: AllPhotosInCollectionInput
  ): Promise<AllPhotosInCollectionResponse | undefined> {
    let collectionInfo;

    if (input.id) {
      collectionInfo = await this.collectionRepository
        .createQueryBuilder("l")
        .where("l.id = :id", { id: input.id })

        .getOne();
    } else if (input.name) {
      collectionInfo = await this.collectionRepository
        .createQueryBuilder("l")
        .where("l.name ilike :name", {
          name: `%${input.name}%`,
        })
        .getOne();
    }

    if (!collectionInfo) {
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
      .where("p.collection.id = :collectionId", {
        collectionId: collectionInfo.id,
      })
      .orderBy("p.sortIndex", "DESC")
      .getMany();

    const total = photos.length;

    return {
      collectionInfo,
      total,
      photos,
    };
  }

  //* Mutations
  @Authorized("ADMIN")
  @Mutation(() => AddCollectionResponse)
  async addCollection(
    @Arg("input", () => AddCollectionInput) input: AddCollectionInput
  ): Promise<AddCollectionResponse> {
    const newCollection = await this.collectionRepository.create(input);
    if (input.coverImageId) {
      const imageId = input.coverImageId;
      const coverImage = await this.imageRepository.findOne(imageId);
      newCollection.coverImage = coverImage;
    }
    await this.collectionRepository.insert(newCollection);
    await this.collectionRepository.save(newCollection);

    return {
      success: true,
      message: `Successfully created new Collection: ${input.name}`,
      newCollection: newCollection,
    };
  }

  @Authorized("ADMIN")
  @Mutation(() => UpdateCollectionResponse)
  async updateCollection(
    @Arg("id", () => Int) id: number,
    @Arg("input", () => UpdateCollectionInput) input: UpdateCollectionInput
  ): Promise<UpdateCollectionResponse> {
    const collection = await this.collectionRepository.findOne(id);
    if (!collection) {
      return {
        success: false,
        message: `Couldn't find collection with id: ${id}`,
      };
    }

    const updatedCollection = { ...collection, ...input };
    if (input.coverImageId) {
      const imageId = input.coverImageId;
      const coverImage = await this.imageRepository.findOne(imageId);
      updatedCollection.coverImage = coverImage;
    }
    const col = await this.collectionRepository.save(updatedCollection);

    return {
      success: true,
      message: `Successfully updated ${col.name}`,
      updatedCollection: col,
    };
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
