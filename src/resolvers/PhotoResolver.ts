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
  photoUrl: string;

  @Field({ nullable: true })
  title?: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => [String])
  subjects: string[];

  @Field(() => [String], { nullable: true })
  tags: string[];

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
  photoUrl?: string;

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
        "collectionsForPhoto",
        "collectionsForPhoto.collection",
      ],
    });
    console.log(`photos: ${JSON.stringify(photos, null, 2)}`);
    return photos;
  }

  @Query(() => [Photo])
  async featuredPhotos(): Promise<Photo[]> {
    const photos = this.photoRepository.find({
      where: { isFeatured: true },
      relations: [
        "location",
        "photographer",
        "collectionsForPhoto",
        "collectionsForPhoto.collection",
        "images",
        "tagsForPhoto",
        "tagsForPhoto.tag",
        "subjectsInPhoto",
        "subjectsInPhoto.subject",
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
        "collectionsForPhoto",
        "collectionsForPhoto.collection",
      ],
    });

    console.log(`photo: ${JSON.stringify(photo, null, 2)}`);
    return photo;
  }

  // @Query(() => [Photo])
  // async photos(): Promise<Photo[]> {
  //   const photos = await this.photoRepository
  //     .createQueryBuilder("p")
  //     .leftJoinAndSelect("p.location", "l")
  //     .leftJoinAndSelect("p.photographer", "pg")
  //     .leftJoinAndSelect("p.collectionsForPhoto", "pc")
  //     .leftJoinAndSelect("pc.collection", "c", "c.id = pc.collectionId")
  //     .orderBy("p.id", "ASC")
  //     .getMany();

  //   console.log(`GET SQL ${JSON.stringify(photos, null, 2)}`);
  //   return photos;
  // }

  // @Query(() => Photo)
  // async photo(@Arg("id", () => Int) id: number) {
  //   const photo = await this.photoRepository
  //     .createQueryBuilder("p")
  //     .leftJoinAndSelect("p.location", "l")
  //     .leftJoinAndSelect("p.photographer", "pg")
  //     .leftJoinAndSelect("p.collectionsForPhoto", "pc")
  //     .leftJoinAndSelect("pc.collection", "c", "c.id = pc.collectionId")
  //     .where("p.id = :id", { id: id })
  //     .orderBy("p.rating", "DESC")
  //     .getOne();

  //   console.log(`GET SQL ${JSON.stringify(photo, null, 2)}`);
  //   return photo;
  // }

  // @FieldResolver(() => Location)
  // async location(@Root() photo: Photo): Promise<Location> {
  //   const location = (await this.locationRepository.findOne(
  //     photo.locationId
  //   )) as Location;
  //   return location;
  // }

  // @FieldResolver(() => Photographer)
  // async photographer(@Root() photo: Photo): Promise<Photographer> {
  //   const photographer = (await this.photographerRepository.findOne(
  //     photo.photographerId
  //   )) as Photographer;
  //   return photographer;
  // }

  // @FieldResolver(() => [Collection])
  // async collectionsForPhoto(@Root() photo: Photo): Promise<Collection[]> {
  //   const collections = await this.collectionRepository
  //     .createQueryBuilder("c")
  //     .leftJoin(PhotoCollection, "pc", "pc.collectionId = c.Id")
  //     .where("pc.photoId = :pId", { pId: photo.id })
  //     .getMany();

  //   return collections;
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

  @Authorized("ADMIN")
  @Mutation(() => Boolean)
  async addPhotoToCollection(
    @Arg("photoId", () => Int) photoId: number,
    @Arg("collectionId", () => Int) collectionId: number
  ): Promise<boolean> {
    const photoCollection = await this.photoCollectionRepository.create({
      photoId: photoId,
      collectionId: collectionId,
    });
    await this.photoCollectionRepository.save(photoCollection);
    return true;
  }

  @Authorized("ADMIN")
  @Mutation(() => Boolean)
  async removePhotoFromCollection(
    @Arg("photoId", () => Int) photoId: number,
    @Arg("collectionId", () => Int) collectionId: number
  ): Promise<boolean> {
    const deleteResult = await this.photoCollectionRepository.delete({
      photoId: photoId,
      collectionId: collectionId,
    });
    if (deleteResult && deleteResult.affected != 0) {
      return true;
    }
    return false;
  }
}
