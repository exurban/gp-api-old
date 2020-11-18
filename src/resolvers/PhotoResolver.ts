import {
  Arg,
  Authorized,
  Field,
  Float,
  InputType,
  Int,
  Mutation,
  Query,
  Resolver,
} from "type-graphql";
import { Repository } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";
import Photo from "../entities/Photo";
// import Location from "../entities/Location";
// import Photographer from "../entities/Photographer";
import PhotoCollection from "../entities/PhotoCollection";
// import Collection from "../entities/Collection";

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

  @Field()
  photographerId: number;

  @Field()
  locationId: number;
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
  discontinued?: boolean;

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

@Resolver(() => Photo)
export default class PhotoResolver {
  //* Repositories
  constructor(
    @InjectRepository(Photo) private photoRepository: Repository<Photo>,
    @InjectRepository(PhotoCollection)
    private photoCollectionRepository: Repository<PhotoCollection> // @InjectRepository(Location) // private locationRepository: Repository<Location>, // @InjectRepository(Collection) // @InjectRepository(Photographer) // private photographerRepository: Repository<Photographer> // , // private collectionRepository: Repository<Collection>
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

  @Query(() => [Photo])
  async featuredPhotos(): Promise<Photo[]> {
    const photos = this.photoRepository.find({
      where: { isFeatured: true },
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

  @Query(() => Photo)
  async photo(@Arg("id", () => Int) id: number): Promise<Photo | undefined> {
    const photo = await this.photoRepository.findOne(id, {
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

    return photo;
  }

  // @Query(() => [Photo])
  // async photos(): Promise<Photo[]> {
  //   const photos = await this.photoRepository
  //     .createQueryBuilder("p")
  //     .leftJoinAndSelect("p.location", "l")
  //     .leftJoinAndSelect("p.photographer", "pg")
  //     .leftJoinAndSelect("p.images", "i", "i.photo_id = p.id")
  //     .leftJoinAndSelect("p.subjectsInPhoto", "ps")
  //     .leftJoinAndSelect("ps.subject", "s", "s.id = ps.subjectId")
  //     .leftJoinAndSelect("p.tagsForPhoto", "tp")
  //     .leftJoinAndSelect("tp.tag", "t", "t.id = tp.tagId")
  //     .leftJoinAndSelect("p.collectionsForPhoto", "pc")
  //     .leftJoinAndSelect("pc.collection", "c", "c.id = pc.collectionId")
  //     .orderBy("p.id", "ASC")
  //     .getMany();

  //   // console.log(`GET SQL ${JSON.stringify(photos, null, 2)}`);
  //   return photos;
  // }

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

  // @Mutation(() => Photo)
  // async updatePhoto(
  //   @Arg("id", () => Int) id: number,
  //   @Arg("input", () => PhotoUpdateInput) input: PhotoUpdateInput
  // ): Promise<Photo | undefined> {
  //   const photo = await this.photoRepository.findOne({ id });
  //   if (!photo) {
  //     throw new Error(`No photo with an id of ${id} exists.`);
  //   }
  //   Object.assign(photo, input);
  //   await photo?.save();

  //   return photo;
  // }
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
