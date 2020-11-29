import {
  Arg,
  Authorized,
  Field,
  Float,
  InputType,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from "type-graphql";
import { Repository } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";
import Photo from "../entities/Photo";
import PhotoCollection from "../entities/PhotoCollection";
import PaginatedResponse from "../abstract/PaginatedResponse";

//* Input Types
@InputType()
class PhotoInput {
  @Field()
  title: string;

  @Field()
  description: string;

  @Field(() => Boolean, { nullable: true })
  isFeatured: boolean;

  @Field(() => Boolean, { nullable: true })
  isLimitedEdition: boolean;

  @Field(() => Int, { nullable: true })
  rating: number;

  @Field(() => Float)
  basePrice: number;

  @Field(() => Float, { nullable: true })
  priceModifier: number;

  @Field(() => Int, { nullable: true })
  photographerId?: number;

  @Field(() => Int, { nullable: true })
  locationId?: number;

  @Field(() => Int, { nullable: true })
  imageId?: number;
}

@InputType()
class PhotoUpdateInput {
  @Field({ nullable: true })
  title?: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => [String], { nullable: true })
  subjects?: string[];

  @Field(() => [String], { nullable: true })
  tags?: string[];

  @Field(() => Boolean, { nullable: true })
  isDiscontinued?: boolean;

  @Field(() => Boolean, { nullable: true })
  isFeatured?: boolean;

  @Field(() => Boolean, { nullable: true })
  isLimitedEdition?: boolean;

  @Field(() => Int, { nullable: true })
  rating?: number;

  @Field(() => Float, { nullable: true })
  basePrice?: number;

  @Field(() => Float, { nullable: true })
  priceModifier?: number;

  @Field({ nullable: true })
  photographerId?: number;

  @Field({ nullable: true })
  locationId?: number;
}

@InputType()
class AllPhotosInput {
  @Field(() => Int, { nullable: true })
  first?: number;

  @Field(() => Int)
  take: number;
}

@InputType()
class AllFeaturedPhotosInput {
  @Field(() => Int, { nullable: true })
  first?: number;

  @Field(() => Int)
  take: number;
}

@ObjectType()
class PaginatedPhotoResponse extends PaginatedResponse(Photo) {}

@Resolver()
export default class PhotoResolver {
  //* Repositories
  constructor(
    @InjectRepository(Photo) private photoRepository: Repository<Photo>,
    @InjectRepository(PhotoCollection)
    private photoCollectionRepository: Repository<PhotoCollection>
  ) {}

  //* Queries
  @Query(() => [Photo])
  async photos(): Promise<Photo[]> {
    const photos = this.photoRepository.find({
      relations: [
        "location",
        "photographer",
        "images",
        "subjectsInPhoto",
        "subjectsInPhoto.subject",
        "tagsForPhoto",
        "tagsForPhoto.tag",
        "collectionsForPhoto",
        "collectionsForPhoto.collection",
      ],
    });
    return photos;
  }

  @Query(() => PaginatedPhotoResponse)
  async allPhotos(
    @Arg("input", () => AllPhotosInput) input: AllPhotosInput
  ): Promise<PaginatedPhotoResponse> {
    const total = await this.photoRepository.count();

    let items;

    if (!input.first) {
      items = await this.photoRepository
        .createQueryBuilder("p")
        .leftJoinAndSelect("p.location", "l")
        .leftJoinAndSelect("p.photographer", "pg")
        .leftJoinAndSelect("p.images", "i")
        .leftJoinAndSelect("p.subjectsInPhoto", "ps")
        .leftJoinAndSelect("ps.subject", "s", "ps.subjectId = s.id")
        .leftJoinAndSelect("p.tagsForPhoto", "pt")
        .leftJoinAndSelect("pt.tag", "t", "pt.tagId = t.id")
        .leftJoinAndSelect("p.collectionsForPhoto", "pc")
        .leftJoinAndSelect("pc.collection", "c", "pc.collectionId = c.id")
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
        .where("p.sortIndex < :first", { first: input.first })
        .orderBy("p.sortIndex", "DESC")
        .take(input.take)
        .getMany();
    }

    const startCursor = items[0].sortIndex;
    const endCursor = items[items.length - 1].sortIndex;
    console.log(`returning ${items.length} photos.`);
    return {
      items,
      startCursor,
      endCursor,
      total,
    };
  }

  @Query(() => PaginatedPhotoResponse)
  async allFeaturedPhotos(
    @Arg("input", () => AllFeaturedPhotosInput) input: AllFeaturedPhotosInput
  ): Promise<PaginatedPhotoResponse> {
    const featuredPhotos = await this.photoRepository.find({
      where: { isFeatured: true },
    });
    const total = featuredPhotos.length;

    let items;

    if (!input.first) {
      items = await this.photoRepository
        .createQueryBuilder("p")
        .leftJoinAndSelect("p.location", "l")
        .leftJoinAndSelect("p.photographer", "pg")
        .leftJoinAndSelect("p.images", "i")
        .leftJoinAndSelect("p.subjectsInPhoto", "ps")
        .leftJoinAndSelect("ps.subject", "s", "ps.subjectId = s.id")
        .leftJoinAndSelect("p.tagsForPhoto", "pt")
        .leftJoinAndSelect("pt.tag", "t", "pt.tagId = t.id")
        .leftJoinAndSelect("p.collectionsForPhoto", "pc")
        .leftJoinAndSelect("pc.collection", "c", "pc.collectionId = c.id")
        .where("p.isFeatured = true")
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
        .where("p.isFeatured = true")
        .andWhere("p.sortIndex < :first", { first: input.first })
        .orderBy("p.sortIndex", "DESC")
        .take(input.take)
        .getMany();
    }

    const startCursor = items[0].sortIndex;
    const endCursor = items[items.length - 1].sortIndex;
    console.log(`returning ${items.length} photos.`);
    return {
      items,
      startCursor,
      endCursor,
      total,
    };
  }

  @Query(() => Photo, { nullable: true })
  async photo(@Arg("id", () => Int) id: number): Promise<Photo | undefined> {
    const photo = await this.photoRepository.findOne(id, {
      relations: [
        "photographer",
        "photographer.image",
        "subjectsInPhoto",
        "subjectsInPhoto.subject",
      ],
    });

    return photo;
  }

  //* Mutations
  @Authorized("ADMIN")
  @Mutation(() => Photo)
  async addPhoto(
    @Arg("input", () => PhotoInput) input: PhotoInput
  ): Promise<Photo> {
    const newPhoto = this.photoRepository.create({
      ...input,
    });
    await this.photoRepository.insert(newPhoto);

    await this.photoRepository.save(newPhoto);
    return newPhoto;
  }

  @Authorized("ADMIN")
  @Mutation(() => Photo)
  async updatePhoto(
    @Arg("id", () => Int) id: number,
    @Arg("input", () => PhotoUpdateInput) input: PhotoUpdateInput
  ): Promise<Photo | undefined> {
    const photo = await this.photoRepository.findOne({ id });
    if (!photo) {
      throw new Error(`No photo with an id of ${id} exists.`);
    } else {
      const updatedPhoto = {
        ...photo,
        ...input,
      };
      await this.photoRepository.save(updatedPhoto);
    }
    return photo;
  }

  /**
   * CHECK BEFORE DELETE
   * - check to see if photo is in favorites, shopping bags or collections
   * - if photo has been purchased, can discontinue, but won't delete
   * - don't delete, just discontinue by default
   * - warn and ask for confirmation of intent to delete
   * - delete these relationships
   */

  //! when deleting Photo, also need to delete from:
  /**-PhotoCollection
   * - UserFavorites
   * - UserShoppingBagItems
   * - PhotoSubject
   * - PhotoTag
   */
  @Authorized("ADMIN")
  @Mutation(() => Boolean)
  async deletePhoto(@Arg("id", () => Int) id: number): Promise<boolean> {
    let result = true;

    // remove photo from Collections
    await this.photoCollectionRepository.delete({ photoId: id });

    const deleteResult = await this.photoRepository.delete({ id });
    if (!deleteResult || deleteResult.affected == 0) {
      result = false;
      throw new Error(`Failed to delete photo.`);
    }
    return result;
  }
}
