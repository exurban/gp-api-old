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
import Tag from "../entities/Tag";
import PhotoTag from "../entities/PhotoTag";
import Photo from "../entities/Photo";
import Image from "../entities/Image";
import { PaginatedPhotosResponse } from "../abstract/PaginatedResponse";
import GroupedResponse from "../abstract/GroupedResponse";
import SuccessMessageResponse from "../abstract/SuccessMessageResponse";

@InputType({
  description: "Inputs to create a new Tag entity.",
})
class AddTagInput {
  @Field({
    description: "Name of the tag. Used in Photo Info links.",
  })
  name: string;

  @Field({
    description: "A vignette used to introduce the tag.",
  })
  description: string;

  @Field(() => Int, {
    nullable: true,
    description: "A cover image to be displayed nest to the opening vignette.",
  })
  coverImageId?: number;
}

@InputType({
  description: "Optional inputs to be used to update the Tag Info.",
})
class UpdateTagInput {
  @Field({
    nullable: true,
    description: "Optional. Name of the tag. Used in Photo Info links.",
  })
  name?: string;

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
class SearchTagsInput {
  @Field()
  searchString: string;
}

@ObjectType()
class SearchTagsResponse {
  @Field(() => [Tag])
  datalist: Tag[];
}

// * ALL
@InputType()
class AllPhotosWithTagInput {
  @Field({ nullable: true })
  id?: number;

  @Field({ nullable: true })
  name?: string;
}

@ObjectType()
class AllPhotosWithTagResponse {
  @Field(() => Tag)
  tagInfo: Tag;

  @Field(() => Int)
  total: number;

  @Field(() => [Photo])
  photos: Photo[];
}

// * GROUPED
@InputType()
class GroupedPhotosWithTagInput {
  @Field({ nullable: true })
  id?: number;

  @Field({ nullable: true })
  name?: string;
}

@ObjectType()
class GroupedPhotosWithTagResponse extends GroupedResponse() {
  @Field(() => Tag)
  tagInfo: Tag;
}

// * PAGINATED
@InputType()
class PaginatedPhotosWithTagInput {
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  id?: number;

  @Field(() => Int, { nullable: true })
  cursor?: number;

  @Field(() => Int)
  take: number;
}

@ObjectType()
class PaginatedPhotosWithTagResponse extends PaginatedPhotosResponse() {
  @Field(() => Tag)
  tagInfo: Tag;
}

@ObjectType()
class AddTagResponse extends SuccessMessageResponse {
  @Field(() => Tag, { nullable: true })
  newTag?: Tag;
}

@ObjectType()
class UpdateTagResponse extends SuccessMessageResponse {
  @Field(() => Tag, { nullable: true })
  updatedTag?: Tag;
}

@Resolver(() => Tag)
export default class TagResolver {
  constructor(
    @InjectRepository(Tag) private tagRepository: Repository<Tag>,
    @InjectRepository(Photo) private photoRepository: Repository<Photo>,
    @InjectRepository(PhotoTag)
    private photoTagRepository: Repository<PhotoTag>,
    @InjectRepository(Image) private imageRepository: Repository<Image>
  ) {}

  @FieldResolver()
  async countOfPhotos(@Root() tag: Tag): Promise<number> {
    return await this.photoTagRepository.count({
      tagId: tag.id,
    });
  }

  // * Queries - Tag + Cover Image Only
  @Query(() => SearchTagsResponse, {
    description: "Search tags. Returns tag + Cover Image.",
  })
  async searchTags(
    @Arg("input", () => SearchTagsInput) input: SearchTagsInput
  ): Promise<SearchTagsResponse> {
    const searchString = input.searchString;

    const tags = await this.tagRepository
      .createQueryBuilder("tag")
      .leftJoinAndSelect("tag.coverImage", "ci")
      .where("tag.name ilike :searchString", {
        searchString: `%${searchString}%`,
      })
      .orWhere("tag.description ilike :searchString", {
        searchString: `%${searchString}%`,
      })
      .getMany();

    const response = { datalist: tags };
    return response;
  }

  @Query(() => Tag)
  async tag(@Arg("id", () => Int) id: number): Promise<Tag | undefined> {
    return await this.tagRepository.findOne(id, {
      relations: ["coverImage"],
    });
  }

  @Query(() => Tag, { nullable: true })
  async tagWithName(
    @Arg("name", () => String) name: string
  ): Promise<Tag | undefined> {
    return await this.tagRepository.findOne({
      where: { name: name },
      relations: ["coverImage"],
    });
  }

  // * Queries = GROUPED Photos with Tag
  @Query(() => GroupedPhotosWithTagResponse)
  async groupedPhotosWithTag(
    @Arg("input", () => GroupedPhotosWithTagInput)
    input: GroupedPhotosWithTagInput
  ): Promise<GroupedPhotosWithTagResponse | undefined> {
    const tagInfo = await this.tagRepository
      .createQueryBuilder("t")
      .where("t.id = :id", { id: input.id })
      .orWhere("t.name ilike :name", { name: `%${input.name}%` })
      .getOne();

    if (!tagInfo) {
      return undefined;
    }

    const photosWithTag = await this.photoTagRepository.find({
      where: { tagId: tagInfo.id },
    });
    const photoIds = photosWithTag.map((pt) => pt.photoId);

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
      .where("p.id IN (:...photoIds)", { photoIds: photoIds })
      .orderBy("p.sortIndex", "DESC")
      .getMany();

    return {
      tagInfo,
      photos,
    };
  }

  // * Queries - PAGINATED Photos with Tag
  @Query(() => PaginatedPhotosWithTagResponse)
  async paginatedPhotosWithTag(
    @Arg("input", () => PaginatedPhotosWithTagInput)
    input: PaginatedPhotosWithTagInput
  ): Promise<PaginatedPhotosWithTagResponse | undefined> {
    const tagInfo = await this.tagRepository.findOne({
      where: { name: input.name },
    });

    if (!tagInfo) {
      return undefined;
    }

    const photosWithTag = await this.photoTagRepository.find({
      where: { tagId: tagInfo.id },
    });
    const photoIds = photosWithTag.map((pt) => pt.photoId);

    const total = photoIds.length;

    let photos;

    if (!input.cursor) {
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
        .where("p.id IN (:...photoIds)", { photoIds: photoIds })
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
        .where("p.id IN (:...photoIds)", { photoIds: photoIds })
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

    console.log(`returning ${photos.length} of ${pageInfo.total} photos.`);

    return {
      tagInfo,
      pageInfo,
      photos,
    };
  }

  // * Queries - PAGINATED Photos with Tag
  @Query(() => AllPhotosWithTagResponse)
  async allPhotosWithTag(
    @Arg("input", () => AllPhotosWithTagInput)
    input: AllPhotosWithTagInput
  ): Promise<AllPhotosWithTagResponse | undefined> {
    const tagInfo = await this.tagRepository.findOne({
      where: { name: input.name },
    });

    if (!tagInfo) {
      return undefined;
    }

    const photosWithTag = await this.photoTagRepository.find({
      where: { tagId: tagInfo.id },
    });
    const photoIds = photosWithTag.map((pt) => pt.photoId);

    const total = photoIds.length;

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
      .where("p.id IN (:...photoIds)", { photoIds: photoIds })
      .orderBy("p.sortIndex", "DESC")
      .getMany();

    console.log(`returning ${total} ${JSON.stringify(tagInfo, null, 2)}`);

    return {
      tagInfo,
      total,
      photos,
    };
  }

  // * Mutations
  @Authorized("ADMIN")
  @Mutation(() => AddTagResponse)
  async addTag(
    @Arg("input", () => AddTagInput) input: AddTagInput
  ): Promise<AddTagResponse> {
    const newTag = await this.tagRepository.create(input);
    if (input.coverImageId) {
      const imageId = input.coverImageId;
      const coverImage = await this.imageRepository.findOne(imageId);
      newTag.coverImage = coverImage;
    }
    await this.tagRepository.insert(newTag);
    await this.tagRepository.save(newTag);

    return {
      success: true,
      message: `Successfully created new Tag: ${input.name}`,
      newTag: newTag,
    };
  }

  @Authorized("ADMIN")
  @Mutation(() => UpdateTagResponse)
  async updateTag(
    @Arg("id", () => Int) id: number,
    @Arg("input", () => UpdateTagInput) input: UpdateTagInput
  ): Promise<UpdateTagResponse> {
    const tag = await this.tagRepository.findOne(id);
    if (!tag) {
      return {
        success: false,
        message: `Couldn't find tag with id: ${id}`,
      };
    }

    const updatedTag = { ...tag, ...input };
    if (input.coverImageId) {
      const imageId = input.coverImageId;
      const coverImage = await this.imageRepository.findOne(imageId);
      updatedTag.coverImage = coverImage;
    }
    const t = await this.tagRepository.save(updatedTag);

    return {
      success: true,
      message: `Successfully update ${t.name}`,
      updatedTag: t,
    };
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
