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
import Tag from "../entities/Tag";

@InputType()
class TagInput {
  @Field()
  name: string;
}

@InputType()
class TagUpdateInput {
  @Field({ nullable: true })
  name?: string;
}

@Resolver(() => Tag)
export default class SubjectResolver {
  constructor(@InjectRepository(Tag) private tagRepository: Repository<Tag>) {}

  //* Queries
  @Query(() => [Tag])
  async tags(): Promise<Tag[]> {
    return await this.tagRepository.find({
      relations: ["photosWithTag", "photosWithTag.photo"],
    });
  }

  @Query(() => Tag)
  async photosWithTag(
    @Arg("input", () => TagInput) input: TagInput
  ): Promise<Tag | undefined> {
    return await Tag.findOne({
      where: { name: input.name },
      relations: ["photosWithTag", "photosWithTag.photo"],
    });
  }

  //* Mutations
  @Authorized("ADMIN")
  @Mutation(() => Tag)
  async addTag(@Arg("input", () => TagInput) input: TagInput): Promise<Tag> {
    return await this.tagRepository.create({ name: input.name }).save();
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
    await this.tagRepository.update(id, { ...input });
    const updatedTag = this.tagRepository.findOne(id);

    return updatedTag;
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
