import {
  Arg,
  Authorized,
  Field,
  InputType,
  Int,
  Mutation,
  Resolver,
} from "type-graphql";
import { Repository } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";

import PhotoFinish from "../entities/PhotoFinish";

@InputType()
class PhotoFinishInput {
  @Field(() => Int)
  photoId: number;

  @Field(() => Int)
  finishId: number;
}

@Resolver(() => PhotoFinish)
export default class PhotoFinishResolver {
  // * Repositories
  constructor(
    @InjectRepository(PhotoFinish)
    private photoFinishRepository: Repository<PhotoFinish>
  ) {}

  // * Mutations
  @Authorized("ADMIN")
  @Mutation(() => Boolean)
  async addFinishToPhoto(
    @Arg("input", () => PhotoFinishInput) input: PhotoFinishInput
  ): Promise<boolean> {
    const newPhotoFinish = this.photoFinishRepository.create({
      ...input,
    });
    const insertResult = await this.photoFinishRepository.insert(
      newPhotoFinish
    );
    if (insertResult) {
      return true;
    }
    return false;
  }

  @Authorized("ADMIN")
  @Mutation(() => Boolean)
  async removeFinishFromPhoto(
    @Arg("input", () => PhotoFinishInput) input: PhotoFinishInput
  ): Promise<boolean> {
    const deleteResult = await this.photoFinishRepository.delete({
      photoId: input.photoId,
      finishId: input.finishId,
    });
    if (deleteResult && deleteResult.affected != 0) {
      return true;
    }
    return false;
  }
}
