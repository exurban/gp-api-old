import {
  Arg,
  Authorized,
  Field,
  InputType,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from "type-graphql";
import { Repository } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";
import Tag from "../entities/Tag";
import PhotoTag from "../entities/PhotoTag";
import Photo from "../entities/Photo";
import Image from "../entities/Image";
import PaginatedResponse from "../abstract/PaginatedResponse";

@InputType()
class TagInput {
  @Field({ nullable: true })
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  coverImageId?: number;
}

@InputType()
class TagUpdateInput {
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  coverImageId?: number;
}

@InputType()
class AllPhotosWithTagInput {
  @Field()
  tag: string;

  @Field(() => Int, { nullable: true })
  cursor?: number;

  @Field(() => Int)
  take: number;
}

@ObjectType()
class PaginatedPhotosOfTagResponse extends PaginatedResponse(Photo) {
  @Field(() => Tag)
  tagInfo: Tag;
}

@Resolver(() => Tag)
export default class SubjectResolver {
  constructor(
    @InjectRepository(Tag) private tagRepository: Repository<Tag>,
    @InjectRepository(Photo) private photoRepository: Repository<Photo>,
    @InjectRepository(PhotoTag)
    private photoTagRepository: Repository<PhotoTag>,
    @InjectRepository(Image) private imageRepository: Repository<Image>
  ) {}

  //* Queries
  @Query(() => PaginatedPhotosOfTagResponse)
  async allPhotosWithTag(
    @Arg("input", () => AllPhotosWithTagInput) input: AllPhotosWithTagInput
  ): Promise<PaginatedPhotosOfTagResponse> {
    /**
     * 1. query subject
     * 2. query photoIds = photosOfSubject.photoId
     * 3. query photoRepository where p.id IN photoIds
     */

    const tagInfo = await this.tagRepository.findOneOrFail({
      where: { name: input.tag },
    });

    const photosWithTag = await this.photoTagRepository.find({
      where: { tagId: tagInfo.id },
    });
    const photoIds = photosWithTag.map((pt) => pt.photoId);

    const total = photoIds.length;

    let items;

    if (!input.cursor) {
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
        .where("p.id IN (:...photoIds)", { photoIds: photoIds })
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
        .where("p.id IN (:...photoIds)", { photoIds: photoIds })
        .andWhere("p.sortIndex < :cursor", { cursor: input.cursor })
        .orderBy("p.sortIndex", "DESC")
        .take(input.take)
        .getMany();
    }

    const startCursor = items[0].sortIndex;
    const endCursor = items[items.length - 1].sortIndex;
    console.log(`returning ${items.length} photos.`);
    return {
      tagInfo,
      items,
      startCursor,
      endCursor,
      total,
    };
  }

  @Query(() => [Tag])
  async tags(): Promise<Tag[]> {
    return await this.tagRepository.find({
      relations: [
        "photosWithTag",
        "photosWithTag.photo",
        "photosWithTag.photo.photographer",
        "photosWithTag.photo.location",
        "photosWithTag.photo.images",
      ],
    });
  }

  @Query(() => Tag)
  async photosWithTag(
    @Arg("input", () => TagInput) input: TagInput
  ): Promise<Tag | undefined> {
    return await this.tagRepository.findOne({
      where: { name: input.name },
      relations: [
        "photosWithTag",
        "photosWithTag.photo",
        "photosWithTag.photo.photographer",
        "photosWithTag.photo.location",
        "photosWithTag.photo.images",
        "photosWithTag.photo.subjectsInPhoto",
        "photosWithTag.photo.subjectsInPhoto.subject",
        "photosWithTag.photo.tagsForPhoto",
        "photosWithTag.photo.tagsForPhoto.tag",
        "photosWithTag.photo.collectionsForPhoto",
        "photosWithTag.photo.collectionsForPhoto.collection",
      ],
    });
  }

  //* Mutations
  @Authorized("ADMIN")
  @Mutation(() => Tag)
  async addTag(@Arg("input", () => TagInput) input: TagInput): Promise<Tag> {
    return await this.tagRepository.create({ ...input }).save();
  }

  @Authorized("ADMIN")
  @Mutation(() => Tag)
  async updateTag(
    @Arg("id", () => Int) id: number,
    @Arg("input", () => TagUpdateInput) input: TagUpdateInput
  ): Promise<Tag | undefined> {
    const tag = await this.tagRepository.findOne(id);
    if (!tag) {
      throw new Error(`No tag with an id of ${id} exists.`);
    }
    if (input.coverImageId && tag) {
      const image = await this.imageRepository.findOne(input.coverImageId);
      tag.coverImage = image;
      await this.tagRepository.save(tag);
      delete input.coverImageId;
    }
    const updatedTag = { ...tag, ...input };
    const t = await this.tagRepository.save(updatedTag);

    return t;
  }

  @Authorized("ADMIN")
  @Mutation(() => Boolean)
  async deleteTag(@Arg("id", () => Int) id: number): Promise<boolean> {
    const deleteResult = await this.tagRepository.delete(id);
    if (deleteResult && deleteResult.affected != 0) {
      return true;
    }
    return false;
  }
}
