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
import Subject from "../entities/Subject";
import Photo from "../entities/Photo";
import PhotoSubject from "../entities/PhotoSubject";
import Image from "../entities/Image";
import { PaginatedPhotosResponse } from "../abstract/PaginatedResponse";
import GroupedResponse from "../abstract/GroupedResponse";
import { SortDirection } from "../abstract/Enum";
import SuccessMessageResponse from "../abstract/SuccessMessageResponse";

//* Input Types
@InputType({
  description: "Inputs to create a new Subject entity.",
})
class AddSubjectInput {
  @Field({
    description: "Name of the subject. Used in Photo Info links.",
  })
  name: string;

  @Field({
    nullable: true,
    description: "A vignette used to introduce the subject.",
  })
  description?: string;

  @Field(() => Int, {
    nullable: true,
    description: "A cover image to be displayed next to the opening vignette.",
  })
  coverImageId?: number;
}

@InputType({
  description: "Optional inputs to be used to update the Subject Info.",
})
class UpdateSubjectInput {
  @Field({
    nullable: true,
    description: "Optional. Name of the subject. Used in Photo Info links.",
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
class SubjectSearchSortInput {
  @Field({ nullable: true })
  filter?: string;

  @Field({ nullable: true, defaultValue: "name" })
  orderBy?: string;

  @Field(() => SortDirection, {
    nullable: true,
    defaultValue: SortDirection.ASC,
  })
  direction?: SortDirection;
}

@ObjectType()
class SubjectsResponse {
  @Field(() => [Subject])
  subjects: Subject[];
}

@InputType()
class SearchSubjectsInput {
  @Field()
  searchString: string;
}

@ObjectType()
class SearchSubjectsResponse {
  @Field(() => [Subject])
  datalist: Subject[];
}

// * ALL
@InputType()
class AllPhotosOfSubjectInput {
  @Field()
  name: string;
}

@ObjectType()
class AllPhotosOfSubjectResponse {
  @Field(() => Subject)
  subjectInfo: Subject;

  @Field(() => Int)
  total: number;

  @Field(() => [Photo])
  photos: Photo[];
}

// * GROUPED
@InputType()
class GroupedPhotosOfSubjectInput {
  @Field({ nullable: true })
  id?: number;

  @Field({ nullable: true })
  name?: string;
}

@ObjectType()
class GroupedPhotosOfSubjectResponse extends GroupedResponse() {
  @Field(() => Subject)
  subjectInfo: Subject;
}

// * PAGINATED
@InputType()
class PaginatedPhotosOfSubjectInput {
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
class PaginatedPhotosOfSubjectResponse extends PaginatedPhotosResponse() {
  @Field(() => Subject)
  subjectInfo: Subject;
}

@ObjectType()
class AddSubjectResponse extends SuccessMessageResponse {
  @Field(() => Subject, { nullable: true })
  newSubject?: Subject;
}

@ObjectType()
class UpdateSubjectResponse extends SuccessMessageResponse {
  @Field(() => Subject, { nullable: true })
  updatedSubject?: Subject;
}

@Resolver(() => Subject)
export default class SubjectResolver {
  constructor(
    @InjectRepository(Subject) private subjectRepository: Repository<Subject>,
    @InjectRepository(Photo) private photoRepository: Repository<Photo>,
    @InjectRepository(PhotoSubject)
    private photoSubjectRepository: Repository<PhotoSubject>,
    @InjectRepository(Image) private imageRepository: Repository<Image>
  ) {}

  @FieldResolver()
  async countOfPhotos(@Root() subject: Subject): Promise<number> {
    return await this.photoSubjectRepository.count({
      subjectId: subject.id,
    });
  }

  // * Queries - Subject + Cover Image Only
  @Query(() => SubjectsResponse, {
    description:
      "Returns all Subjects + cover images. Sortable and filterable.",
  })
  async subjects(
    @Arg("input", () => SubjectSearchSortInput) input: SubjectSearchSortInput
  ): Promise<SubjectsResponse> {
    const filter = input.filter || "";
    const orderString = `sbj.${input.orderBy}` || "name";
    const dir = input.direction || SortDirection.ASC;

    const sbj = await this.subjectRepository
      .createQueryBuilder("sbj")
      .leftJoinAndSelect("sbj.coverImage", "ci")
      .where("sbj.name ilike :filter", { filter: `%${filter}%` })
      .orWhere("sbj.description ilike :filter", { filter: `%${filter}%` })
      .orderBy(orderString, dir)
      .getMany();

    const response = { subjects: sbj };
    return response;
  }

  @Query(() => SearchSubjectsResponse, {
    description: "Search subjects. Returns Subjects + Cover Image.",
  })
  async searchSubjects(
    @Arg("input", () => SearchSubjectsInput) input: SearchSubjectsInput
  ): Promise<SearchSubjectsResponse> {
    const searchString = input.searchString;

    const subj = await this.subjectRepository
      .createQueryBuilder("subj")
      .leftJoinAndSelect("subj.coverImage", "ci")
      .where("subj.name ilike :searchString", {
        searchString: `%${searchString}%`,
      })
      .orWhere("subj.description ilike :searchString", {
        searchString: `%${searchString}%`,
      })
      .getMany();

    const response = { datalist: subj };
    return response;
  }

  @Query(() => Subject, { nullable: true })
  async subject(
    @Arg("id", () => Int) id: number
  ): Promise<Subject | undefined> {
    return await this.subjectRepository.findOne(id, {
      relations: ["coverImage"],
    });
  }

  @Query(() => Subject, { nullable: true })
  async subjectWithName(
    @Arg("name", () => String) name: string
  ): Promise<Subject | undefined> {
    return await this.subjectRepository.findOne({
      where: { name: name },
      relations: ["coverImage"],
    });
  }

  // * Queries - GROUPED Photos of Subject

  @Query(() => GroupedPhotosOfSubjectResponse)
  async groupedPhotosOfSubject(
    @Arg("input", () => GroupedPhotosOfSubjectInput)
    input: GroupedPhotosOfSubjectInput
  ): Promise<GroupedPhotosOfSubjectResponse | undefined> {
    const subjectInfo = await this.subjectRepository
      .createQueryBuilder("s")
      .where("s.id = :id", { id: input.id })
      .orWhere("s.name ilike :name", { name: `%${input.name}%` })
      .getOne();

    if (!subjectInfo) {
      return undefined;
    }

    const photosOfSubject = await this.photoSubjectRepository.find({
      where: { subjectId: subjectInfo.id },
    });
    const photoIds = photosOfSubject.map((ps) => ps.photoId);

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
      subjectInfo,
      photos,
    };
  }

  // * Queries - PAGINATED Photos of Subject
  @Query(() => PaginatedPhotosOfSubjectResponse)
  async paginatedPhotosOfSubject(
    @Arg("input", () => PaginatedPhotosOfSubjectInput)
    input: PaginatedPhotosOfSubjectInput
  ): Promise<PaginatedPhotosOfSubjectResponse | undefined> {
    /**
     * 1. query subject
     * 2. query photoIds = photosOfSubject.photoId
     * 3. query photoRepository where p.id IN photoIds
     */

    console.log(
      `***request for---${input.name}---${input.take}---${input.cursor}***`
    );
    const subjectInfo = await this.subjectRepository
      .createQueryBuilder("s")
      .where("s.id = :id", { id: input.id })
      .orWhere("s.name ilike :name", { name: `%${input.name}%` })
      .getOne();

    if (!subjectInfo) {
      return undefined;
    }

    const photosOfSubject = await this.photoSubjectRepository.find({
      where: { subjectId: subjectInfo.id },
    });
    const photoIds = photosOfSubject.map((ps) => ps.photoId);

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

    console.log(
      `Returning ${photos.length} of ${total} photos with sortIndexes ${pageInfo.startCursor} - ${pageInfo.endCursor}.`
    );

    return {
      subjectInfo,
      pageInfo,
      photos,
    };
  }

  // * Queries - ALL Photos of Subject
  @Query(() => AllPhotosOfSubjectResponse)
  async allPhotosOfSubject(
    @Arg("input", () => AllPhotosOfSubjectInput)
    input: AllPhotosOfSubjectInput
  ): Promise<AllPhotosOfSubjectResponse | undefined> {
    /**
     * 1. query subject
     * 2. query photoIds = photosOfSubject.photoId
     * 3. query photoRepository where p.id IN photoIds
     */

    console.log(`***request for all photos of subject---${input.name}***`);
    const subjectInfo = await this.subjectRepository
      .createQueryBuilder("s")
      .where("s.name ilike :name", { name: `%${input.name}%` })
      .getOne();

    if (!subjectInfo) {
      return undefined;
    }

    const photosOfSubject = await this.photoSubjectRepository.find({
      where: { subjectId: subjectInfo.id },
    });
    const photoIds = photosOfSubject.map((ps) => ps.photoId);

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

    console.log(`Returning ${photos.length} of ${total} photos`);

    return {
      subjectInfo,
      total,
      photos,
    };
  }

  //* Mutations
  @Authorized("ADMIN")
  @Mutation(() => AddSubjectResponse)
  async addSubject(
    @Arg("input", () => AddSubjectInput) input: AddSubjectInput
  ): Promise<AddSubjectResponse> {
    const newSubject = await this.subjectRepository.create(input);
    if (input.coverImageId) {
      const imageId = input.coverImageId;
      const coverImage = await this.imageRepository.findOne(imageId);
      newSubject.coverImage = coverImage;
    }
    await this.subjectRepository.insert(newSubject);
    await this.subjectRepository.save(newSubject);

    return {
      success: true,
      message: `Successfully created new Subject: ${input.name}`,
      newSubject: newSubject,
    };
  }

  @Authorized("ADMIN")
  @Mutation(() => UpdateSubjectResponse)
  async updateSubject(
    @Arg("id", () => Int) id: number,
    @Arg("input", () => UpdateSubjectInput) input: UpdateSubjectInput
  ): Promise<UpdateSubjectResponse> {
    const subject = await this.subjectRepository.findOne(id);
    if (!subject) {
      return {
        success: false,
        message: `Couldn't find subject with id: ${id}`,
      };
    }

    const updatedSubject = { ...subject, ...input };
    if (input.coverImageId) {
      const imageId = input.coverImageId;
      const coverImage = await this.imageRepository.findOne(imageId);
      updatedSubject.coverImage = coverImage;
    }
    const sbj = await this.subjectRepository.save(updatedSubject);

    return {
      success: true,
      message: `Successfully updated ${sbj.name}`,
      updatedSubject: sbj,
    };
  }

  @Authorized("ADMIN")
  @Mutation(() => Boolean)
  async deleteSubject(@Arg("id", () => Int) id: number): Promise<boolean> {
    const deleteResult = await this.subjectRepository.delete(id);
    if (deleteResult && deleteResult.affected != 0) {
      return true;
    }
    return false;
  }
}
