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

import PhotoCollection from "../entities/PhotoCollection";

@InputType()
class PhotoCollectionInput {
  @Field(() => Int)
  photoId: number;

  @Field(() => Int)
  collectionId: number;
}

@Resolver(() => PhotoCollection)
export default class PhotoCollectionResolver {
  // * Repositories
  constructor(
    @InjectRepository(PhotoCollection)
    private photoCollectionRepository: Repository<PhotoCollection>
  ) {}

  // * Mutations
  @Authorized("ADMIN")
  @Mutation(() => Boolean)
  async addPhotoToCollection(
    @Arg("input", () => PhotoCollectionInput) input: PhotoCollectionInput
  ): Promise<boolean> {
    const newPhotoCollection = this.photoCollectionRepository.create({
      ...input,
    });
    const insertResult = await this.photoCollectionRepository.insert(
      newPhotoCollection
    );
    if (insertResult) {
      return true;
    }
    return false;
  }

  @Authorized("ADMIN")
  @Mutation(() => Boolean)
  async removePhotoFromCollection(
    @Arg("input", () => PhotoCollectionInput) input: PhotoCollectionInput
  ): Promise<boolean> {
    const deleteResult = await this.photoCollectionRepository.delete({
      photoId: input.photoId,
      collectionId: input.collectionId,
    });
    if (deleteResult && deleteResult.affected != 0) {
      return true;
    }
    return false;
  }
}
