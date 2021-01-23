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
import Image from "../entities/Image";
import Photographer from "../entities/Photographer";
import Location from "../entities/Location";
import Subject from "../entities/Subject";
import PhotoSubject from "../entities/PhotoSubject";
import Tag from "../entities/Tag";
import PhotoTag from "../entities/PhotoTag";
import Collection from "../entities/Collection";
import PhotoCollection from "../entities/PhotoCollection";
import Finish from "../entities/Finish";
import PhotoFinish from "../entities/PhotoFinish";
import { PaginatedPhotosResponse } from "../abstract/PaginatedResponse";
import { SortDirection } from "../abstract/Enum";
import SelectionOption from "../abstract/SelectionOption";

//* Input Types
@InputType()
class PhotoInput {
  @Field({ nullable: true, defaultValue: "Untitled" })
  title: string;

  @Field({ nullable: true, defaultValue: "No description provided." })
  description: string;

  @Field(() => Boolean, { nullable: true, defaultValue: false })
  isFeatured: boolean;

  @Field(() => Boolean, { nullable: true, defaultValue: false })
  isLimitedEdition: boolean;

  @Field(() => Int, { nullable: true, defaultValue: 5 })
  rating: number;

  @Field(() => Float, { nullable: true, defaultValue: 375.0 })
  basePrice: number;

  @Field(() => Float, { nullable: true, defaultValue: 0 })
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

  @Field(() => [Int], { nullable: true })
  subjectIds?: number[];

  @Field(() => [Int], { nullable: true })
  tagIds?: number[];

  @Field(() => [Int], { nullable: true })
  collectionIds?: number[];

  @Field(() => [Int], { nullable: true })
  finishIds?: number[];
}

@InputType()
class PhotoSearchSortInput {
  @Field({ nullable: true })
  filter?: string;

  @Field({ nullable: true, defaultValue: "sortIndex" })
  orderBy?: string;

  @Field(() => SortDirection, {
    nullable: true,
    defaultValue: SortDirection.ASC,
  })
  direction?: SortDirection;
}

@ObjectType()
class PhotosResponse {
  @Field(() => [Photo])
  photos: Photo[];
}

@ObjectType()
class UpdatePhotoResponse {
  @Field(() => Boolean)
  success: boolean;

  @Field(() => String)
  message: string;

  @Field(() => Photo, { nullable: true })
  photo?: Photo;
}

@ObjectType()
class PhotographerSelectionOption extends SelectionOption {}

@ObjectType()
class LocationSelectionOption extends SelectionOption {}

@ObjectType()
class SubjectSelectionOption extends SelectionOption {}

@ObjectType()
class TagSelectionOption extends SelectionOption {}

@ObjectType()
class CollectionSelectionOption extends SelectionOption {}

@ObjectType()
class FinishSelectionOption extends SelectionOption {}

@ObjectType()
class PhotoEditSelectionOptions {
  @Field(() => [PhotographerSelectionOption])
  photographers: PhotographerSelectionOption[];

  @Field(() => [LocationSelectionOption])
  locations: LocationSelectionOption[];

  @Field(() => [SubjectSelectionOption])
  subjects: SubjectSelectionOption[];

  @Field(() => [TagSelectionOption])
  tags: TagSelectionOption[];

  @Field(() => [CollectionSelectionOption])
  collections: CollectionSelectionOption[];

  @Field(() => [FinishSelectionOption])
  finishes: FinishSelectionOption[];
}

@InputType()
class SearchPhotosInput {
  @Field()
  searchString: string;
}

@ObjectType()
class SearchPhotosResponse {
  @Field(() => [Photo])
  datalist: Photo[];
}

@InputType()
class PaginatedPhotosInput {
  @Field(() => Int, { nullable: true })
  cursor?: number;

  @Field(() => Int)
  take: number;
}

@ObjectType()
class PaginatedAllPhotosResponse extends PaginatedPhotosResponse() {}

@ObjectType()
class PaginatedFeaturedPhotosResponse extends PaginatedPhotosResponse() {}

@Resolver()
export default class PhotoResolver {
  //* Repositories
  constructor(
    @InjectRepository(Photo) private photoRepository: Repository<Photo>,
    @InjectRepository(Image) private imageRepository: Repository<Image>,

    @InjectRepository(Photographer)
    private photographerRepository: Repository<Photographer>,
    @InjectRepository(Location)
    private locationRepository: Repository<Location>,

    @InjectRepository(Subject) private subjectRepository: Repository<Subject>,
    @InjectRepository(PhotoSubject)
    private photoSubjectRepository: Repository<PhotoSubject>,

    @InjectRepository(Tag) private tagRepository: Repository<Tag>,
    @InjectRepository(PhotoTag)
    private photoTagRepository: Repository<PhotoTag>,

    @InjectRepository(Collection)
    private collectionRepository: Repository<Collection>,
    @InjectRepository(PhotoCollection)
    private photoCollectionRepository: Repository<PhotoCollection>,

    @InjectRepository(Finish)
    private finishRepository: Repository<Finish>,
    @InjectRepository(PhotoFinish)
    private photoFinishRepository: Repository<PhotoFinish>
  ) {}

  // * Queries -
  @Query(() => PhotosResponse, {
    description: "Returns all Photos + all relations. Sortable and filterable.",
  })
  async photos(
    @Arg("input", () => PhotoSearchSortInput) input: PhotoSearchSortInput
  ): Promise<PhotosResponse> {
    const filter = input.filter || "";
    const orderString = input.orderBy ? `p.${input.orderBy}` : `p.sortIndex`;
    const dir = input.direction || SortDirection.ASC;

    console.log(`${filter} ${orderString} ${dir}`);
    const ps = await this.photoRepository
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
      .where("s.name ilike :filter", { filter: `%${filter}%` })
      .orWhere("s.description ilike :filter", { filter: `%${filter}%` })
      .orWhere("t.name ilike :filter", { filter: `%${filter}%` })
      .orWhere("t.description ilike :filter", { filter: `%${filter}%` })
      .orWhere("c.name ilike :filter", { filter: `%${filter}%` })
      .orWhere("c.description ilike :filter", { filter: `%${filter}%` })
      .orWhere("l.name ilike :filter", { filter: `%${filter}%` })
      .orWhere("l.tag ilike :filter", { filter: `%${filter}%` })
      .orWhere("l.description ilike :filter", { filter: `%${filter}%` })
      .orWhere("pg.name ilike :filter", { filter: `%${filter}%` })
      .orWhere("pg.firstName ilike :filter", { filter: `%${filter}%` })
      .orWhere("pg.lastName ilike :filter", { filter: `%${filter}%` })
      .orWhere("pg.email ilike :filter", { filter: `%${filter}%` })
      .orWhere("pg.bio ilike :filter", { filter: `%${filter}%` })
      .orderBy(orderString, dir)
      .getMany();

    console.log(`photos count: ${ps.length}`);
    const response = { photos: ps };
    return response;
  }

  @Query(() => SearchPhotosResponse, {
    description: "Returns all Photos + all relations. Sortable and filterable.",
  })
  async searchPhotos(
    @Arg("input", () => SearchPhotosInput) input: SearchPhotosInput
  ): Promise<SearchPhotosResponse> {
    const searchString = input.searchString;

    const ps = await this.photoRepository
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
      .where("s.name ilike :searchString", {
        searchString: `%${searchString}%`,
      })
      .orWhere("s.description ilike :searchString", {
        searchString: `%${searchString}%`,
      })
      .orWhere("t.name ilike :searchString", {
        searchString: `%${searchString}%`,
      })
      .orWhere("t.description ilike :searchString", {
        searchString: `%${searchString}%`,
      })
      .orWhere("c.name ilike :searchString", {
        searchString: `%${searchString}%`,
      })
      .orWhere("c.description ilike :searchString", {
        searchString: `%${searchString}%`,
      })
      .orWhere("l.name ilike :searchString", {
        searchString: `%${searchString}%`,
      })
      .orWhere("l.tag ilike :searchString", {
        searchString: `%${searchString}%`,
      })
      .orWhere("l.description ilike :searchString", {
        searchString: `%${searchString}%`,
      })
      .orWhere("pg.name ilike :searchString", {
        searchString: `%${searchString}%`,
      })
      .orWhere("pg.firstName ilike :searchString", {
        searchString: `%${searchString}%`,
      })
      .orWhere("pg.lastName ilike :searchString", {
        searchString: `%${searchString}%`,
      })
      .orWhere("pg.email ilike :searchString", {
        searchString: `%${searchString}%`,
      })
      .orWhere("pg.bio ilike :searchString", {
        searchString: `%${searchString}%`,
      })
      .getMany();

    const response = { datalist: ps };
    return response;
  }

  @Query(() => PaginatedAllPhotosResponse)
  async paginatedPhotos(
    @Arg("input", () => PaginatedPhotosInput) input: PaginatedPhotosInput
  ): Promise<PaginatedAllPhotosResponse> {
    const total = await this.photoRepository.count();

    let photos;

    if (!input.cursor) {
      photos = await this.photoRepository
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
        .orderBy("p.sku", "ASC")
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
        .where("p.sku > :cursor", { cursor: input.cursor })
        .orderBy("p.sku", "ASC")
        .take(input.take)
        .getMany();
    }

    console.log(
      `Received request for ${input.take} photos with cursor ${input.cursor}.`
    );

    const pageInfo = {
      startCursor: photos[0].sortIndex,
      endCursor: photos[photos.length - 1].sortIndex,
      total: total,
    };

    console.log(
      `Returning ${photos.length} of ${total} photos with sortIndexes ${pageInfo.startCursor} - ${pageInfo.endCursor}.`
    );

    return {
      photos,
      pageInfo,
    };
  }

  @Query(() => PaginatedFeaturedPhotosResponse)
  async paginatedFeaturedPhotos(
    @Arg("input", () => PaginatedPhotosInput)
    input: PaginatedPhotosInput
  ): Promise<PaginatedFeaturedPhotosResponse> {
    const total = await this.photoRepository.count({
      where: { isFeatured: true },
    });

    let photos;

    if (!input.cursor) {
      photos = await this.photoRepository
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
        .where("p.isFeatured = true")
        .andWhere("p.sortIndex < :cursor", { cursor: input.cursor })
        .orderBy("p.sortIndex", "DESC")
        .take(input.take)
        .getMany();
    }

    const pageInfo = {
      startCursor: photos[0].sortIndex,
      endCursor: photos[photos.length - 1].sortIndex,
      total: total,
    };

    console.log(`returning ${photos.length} of ${total} photos.`);

    return {
      pageInfo,
      photos,
    };
  }

  @Query(() => Photo, { nullable: true })
  async photo(@Arg("id", () => Int) id: number): Promise<Photo | undefined> {
    const photo = await this.photoRepository.findOne(id, {
      relations: [
        "images",
        "photographer",
        "photographer.coverImage",
        "location",
        "subjectsInPhoto",
        "subjectsInPhoto.subject",
        "tagsForPhoto",
        "tagsForPhoto.tag",
        "collectionsForPhoto",
        "collectionsForPhoto.collection",
        "finishesForPhoto",
        "finishesForPhoto.finish",
      ],
    });

    return photo;
  }

  @Query(() => Photo)
  async photoWithSku(
    @Arg("sku", () => Int) sku: number
  ): Promise<Photo | undefined> {
    const photo = await this.photoRepository
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
      .leftJoinAndSelect("p.finishesForPhoto", "pf")
      .leftJoinAndSelect("pf.finish", "f", "f.id = pf.finishId")
      .where("p.sku = :sku", { sku: sku })

      .getOne();
    return photo;
  }

  @Query(() => PhotoEditSelectionOptions)
  async photoEditOptions(): Promise<PhotoEditSelectionOptions> {
    const pgs = await this.photographerRepository.find({
      select: ["id", "name"],
    });
    const photographers = pgs.map((pg) => ({ id: pg.id, name: pg.name }));

    const locs = await this.locationRepository.find({
      select: ["id", "name"],
    });
    const locations = locs.map((loc) => ({ id: loc.id, name: loc.name }));

    const subj = await this.subjectRepository.find({
      select: ["id", "name"],
    });
    const subjects = subj.map((s) => ({ id: s.id, name: s.name }));

    const tgs = await this.tagRepository.find({
      select: ["id", "name"],
    });
    const tags = tgs.map((t) => ({ id: t.id, name: t.name }));

    const colls = await this.collectionRepository.find({
      select: ["id", "name"],
    });
    const collections = colls.map((c) => ({ id: c.id, name: c.name }));

    const fins = await this.finishRepository.find({
      select: ["id", "name"],
    });
    const finishes = fins.map((f) => ({ id: f.id, name: f.name }));

    return {
      photographers: photographers,
      locations: locations,
      subjects: subjects,
      tags: tags,
      collections: collections,
      finishes: finishes,
    };
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
    const newImage = this.imageRepository.create({
      size: "xl",
      photo: newPhoto,
    });

    newPhoto.images[0] = newImage;
    await this.photoRepository.save(newPhoto);

    console.log(`newPhoto: ${JSON.stringify(newPhoto, null, 2)}`);
    console.log(`newImage: ${JSON.stringify(newImage, null, 2)}`);
    return newPhoto;
  }

  @Authorized("ADMIN")
  @Mutation(() => UpdatePhotoResponse)
  async updatePhoto(
    @Arg("id", () => Int) id: number,
    @Arg("input", () => PhotoUpdateInput) input: PhotoUpdateInput
  ): Promise<UpdatePhotoResponse> {
    let photo = await this.photoRepository.findOne(id, {
      relations: [
        "subjectsInPhoto",
        "tagsForPhoto",
        "collectionsForPhoto",
        "finishesForPhoto",
      ],
    });

    if (!photo) {
      return {
        success: false,
        message: `Photo with id ${id} does not exist.`,
      };
    }

    console.log(
      `Saving ${photo.sku} BASE PRICE: ${photo.basePrice} => ${input.basePrice}\n modifier: ${photo.priceModifier} => ${input.priceModifier}`
    );

    console.log(
      `Saving ${photo.sku} featured: ${photo.isFeatured} => ${input.isFeatured}\n ltd: ${photo.isLimitedEdition} => ${input.isLimitedEdition}`
    );

    photo.title = input.title != null ? input.title : photo.title;
    photo.description =
      input.description != null ? input.description : photo.description;
    photo.isFeatured =
      input.isFeatured != null ? input.isFeatured : photo.isFeatured;
    photo.isLimitedEdition =
      input.isLimitedEdition != null
        ? input.isLimitedEdition
        : photo.isLimitedEdition;
    photo.isDiscontinued =
      input.isDiscontinued != null
        ? input.isDiscontinued
        : photo.isDiscontinued;
    photo.rating = input.rating != null ? input.rating : photo.rating;
    photo.basePrice =
      input.basePrice != null ? input.basePrice : photo.basePrice;
    photo.priceModifier =
      input.priceModifier != null ? input.priceModifier : photo.priceModifier;

    if (input.photographerId) {
      const pg = await this.photographerRepository.findOne({
        id: input.photographerId,
      });
      photo.photographer = pg;
    }

    if (input.locationId) {
      const loc = await this.locationRepository.findOne({
        id: input.locationId,
      });
      if (loc) {
        photo.location = loc;
      }
    }

    // * subjects
    if (input.subjectIds) {
      // use photo.id to find all existing entries and remove them
      const photoSubjectsToDelete = await this.photoSubjectRepository.find({
        where: { photoId: photo.id },
      });
      await this.photoSubjectRepository.remove(photoSubjectsToDelete);

      const newPhotoSubjects: PhotoSubject[] = [];
      for await (const subjectId of input.subjectIds) {
        const newPhotoSubject = await this.photoSubjectRepository.create({
          photoId: photo.id,
          subjectId: subjectId,
        });
        newPhotoSubjects.push(newPhotoSubject);
      }

      await this.photoSubjectRepository.save(newPhotoSubjects);
      photo.subjectsInPhoto = newPhotoSubjects;
    }

    // * tags
    if (input.tagIds) {
      // use photo.id to find all existing entries and remove them
      const photoTagsToDelete = await this.photoTagRepository.find({
        where: { photoId: photo.id },
      });
      await this.photoTagRepository.remove(photoTagsToDelete);

      const newPhotoTags: PhotoTag[] = [];
      for await (const tagId of input.tagIds) {
        const newPhotoTag = await this.photoTagRepository.create({
          photoId: photo.id,
          tagId: tagId,
        });
        newPhotoTags.push(newPhotoTag);
      }

      await this.photoTagRepository.save(newPhotoTags);
      photo.tagsForPhoto = newPhotoTags;
    }

    // * collections
    if (input.collectionIds) {
      // use photo.id to find all existing entries and remove them
      const photoCollectionsToDelete = await this.photoCollectionRepository.find(
        {
          where: { photoId: photo.id },
        }
      );
      await this.photoCollectionRepository.remove(photoCollectionsToDelete);

      const newPhotoCollections: PhotoCollection[] = [];
      for await (const collectionId of input.collectionIds) {
        const newPhotoCollection = await this.photoCollectionRepository.create({
          photoId: photo.id,
          collectionId: collectionId,
        });
        newPhotoCollections.push(newPhotoCollection);
      }

      await this.photoCollectionRepository.save(newPhotoCollections);
      photo.collectionsForPhoto = newPhotoCollections;
    }

    // * finishes
    if (input.finishIds) {
      // use photo.id to find all existing entries and remove them
      const photoFinishesToDelete = await this.photoFinishRepository.find({
        where: { photoId: photo.id },
      });
      await this.photoFinishRepository.remove(photoFinishesToDelete);

      const newPhotoFinishes: PhotoFinish[] = [];
      for await (const finishId of input.finishIds) {
        const newPhotoFinish = await this.photoFinishRepository.create({
          photoId: photo.id,
          finishId: finishId,
        });
        newPhotoFinishes.push(newPhotoFinish);
      }

      await this.photoFinishRepository.save(newPhotoFinishes);
      photo.finishesForPhoto = newPhotoFinishes;
    }

    photo = await photo.save();

    console.log(`Updated photo is ${JSON.stringify(photo, null, 2)}`);

    return {
      success: true,
      message: `Successfully updated photo ${photo.sku}.`,
      photo: photo,
    };
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
