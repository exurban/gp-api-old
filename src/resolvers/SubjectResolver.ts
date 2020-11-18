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
import Subject from "../entities/Subject";

@InputType()
class SubjectInput {
  @Field()
  name: string;
}

@InputType()
class SubjectUpdateInput {
  @Field({ nullable: true })
  name?: string;
}

@Resolver(() => Subject)
export default class SubjectResolver {
  constructor(
    @InjectRepository(Subject) private subjectRepository: Repository<Subject>
  ) {}

  //* Queries
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

  @Query(() => Subject)
  async subjectWithName(
    @Arg("input", () => SubjectInput) input: SubjectInput
  ): Promise<Subject | undefined> {
    return await Subject.findOne({
      where: { name: input.name },
      relations: [
        "photosOfSubject",
        "photosOfSubject.photo",
        "photosOfSubject.photo.location",
        "photosOfSubject.photo.photographer",
        "photosOfSubject.photo.images",
        "photosOfSubject.photo.subjectsInPhoto",
        "photosOfSubject.photo.subjectsInPhoto.subject",
        "photosOfSubject.photo.tagsForPhoto",
        "photosOfSubject.photo.tagsForPhoto.tag",
        "photosOfSubject.photo.collectionsForPhoto",
        "photosOfSubject.photo.collectionsForPhoto.collection",
      ],
    });
  }

  //* Mutations
  @Authorized("ADMIN")
  @Mutation(() => Subject)
  async addSubject(
    @Arg("input", () => SubjectInput) input: SubjectInput
  ): Promise<Subject> {
    return await this.subjectRepository.create({ name: input.name }).save();
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
    await this.subjectRepository.update(id, { ...input });
    const updatedSubject = this.subjectRepository.findOne(id);

    return updatedSubject;
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
