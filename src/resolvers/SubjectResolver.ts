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
import Subject from "../entities/Subject";
import Photo from "../entities/Photo";
import PhotoSubject from "../entities/PhotoSubject";
import Image from "../entities/Image";
import PaginatedResponse from "../abstract/PaginatedResponse";

@InputType()
class SubjectInput {
  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  coverImageId?: number;
}

@InputType()
class SubjectUpdateInput {
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  coverImageId?: number;
}

@InputType()
class AllPhotosOfSubjectInput {
  @Field()
  subject: string;

  @Field(() => Int, { nullable: true })
  cursor?: number;

  @Field(() => Int)
  take: number;
}

@ObjectType()
class PaginatedPhotosOfSubjectResponse extends PaginatedResponse(Photo) {
  @Field(() => Subject)
  subjectInfo: Subject;
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

  //* Queries
  @Query(() => PaginatedPhotosOfSubjectResponse)
  async allPhotosOfSubject(
    @Arg("input", () => AllPhotosOfSubjectInput) input: AllPhotosOfSubjectInput
  ): Promise<PaginatedPhotosOfSubjectResponse> {
    /**
     * 1. query subject
     * 2. query photoIds = photosOfSubject.photoId
     * 3. query photoRepository where p.id IN photoIds
     */

    const subjectInfo = await this.subjectRepository.findOneOrFail({
      where: { name: input.subject },
    });

    const photosOfSubject = await this.photoSubjectRepository.find({
      where: { subjectId: subjectInfo.id },
    });
    const photoIds = photosOfSubject.map((ps) => ps.photoId);

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

    return {
      subjectInfo,
      items,
      startCursor,
      endCursor,
      total,
    };
  }

  @Query(() => [Subject])
  async subjects(): Promise<Subject[]> {
    return await this.subjectRepository.find({
      relations: [
        "photosOfSubject",
        "photosOfSubject.photo",
        "photosOfSubject.photo.images",
        "photosOfSubject.photo.tagsForPhoto",
        "photosOfSubject.photo.tagsForPhoto.tag",
        "photosOfSubject.photo.photographer",
        "photosOfSubject.photo.location",
      ],
    });
  }

  @Query(() => Subject)
  async subject(
    @Arg("id", () => Int) id: number
  ): Promise<Subject | undefined> {
    return await Subject.findOne(id, {
      relations: [
        "photosOfSubject",
        "photosOfSubject.photo",
        "photosOfSubject.photo.images",
        "photosOfSubject.photo.tagsForPhoto",
        "photosOfSubject.photo.tagsForPhoto.tag",
        "photosOfSubject.photo.photographer",
        "photosOfSubject.photo.location",
      ],
    });
  }

  @Query(() => Subject, { nullable: true })
  async subjectWithName(
    @Arg("input", () => SubjectInput) input: SubjectInput
  ): Promise<Subject | undefined> {
    const subject = await this.subjectRepository
      .createQueryBuilder("s")
      .leftJoinAndSelect("s.photosOfSubject", "ps")
      .leftJoinAndSelect("ps.photo", "p")
      .leftJoinAndSelect("p.images", "pi")
      .leftJoinAndSelect("p.photographer", "pg")
      .leftJoinAndSelect("p.location", "l")
      .leftJoinAndSelect("p.subjectsInPhoto", "psps")
      .leftJoinAndSelect("psps.subject", "ss", "psps.subjectId = ss.id")
      .leftJoinAndSelect("p.tagsForPhoto", "pt")
      .leftJoinAndSelect("pt.tag", "t", "pt.tagId = t.id")
      .leftJoinAndSelect("p.collectionsForPhoto", "pc")
      .leftJoinAndSelect("pc.collection", "c", "pc.collectionId = c.id")
      .where("s.name = :name", { name: input.name })
      .getOne();

    return subject;
  }

  //* Mutations
  @Authorized("ADMIN")
  @Mutation(() => Subject)
  async addSubject(
    @Arg("input", () => SubjectInput) input: SubjectInput
  ): Promise<Subject> {
    return await this.subjectRepository.create({ ...input }).save();
  }

  @Authorized("ADMIN")
  @Mutation(() => Subject)
  async updateSubject(
    @Arg("id", () => Int) id: number,
    @Arg("input", () => SubjectUpdateInput) input: SubjectUpdateInput
  ): Promise<Subject | undefined> {
    const subject = await this.subjectRepository.findOne(id);
    if (!subject) {
      throw new Error(`No subject with an id of ${id} exists.`);
    }
    if (input.coverImageId && subject) {
      const image = await this.imageRepository.findOne(input.coverImageId);
      subject.coverImage = image;
      await this.subjectRepository.save(subject);
      delete input.coverImageId;
    }
    const updatedSubject = { ...subject, ...input };
    const s = await this.subjectRepository.save(updatedSubject);

    return s;
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
