import User from "../../entities/User";
import UserShoppingBagItem from "../../entities/UserShoppingBagItem";
import Photo from "../../entities/Photo";
import SuccessMessageResponse from "../../abstract/SuccessMessageResponse";
import {
  Arg,
  Authorized,
  Ctx,
  Field,
  ID,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from "type-graphql";
import { InjectRepository } from "typeorm-typedi-extensions";
import { Repository } from "typeorm";

interface Context {
  user: User;
}

@ObjectType()
class ShoppingBagItemsResponse {
  @Field(() => [Photo], {
    nullable: true,
    description: "Returns list of Photo objects in user's shopping bag.",
  })
  photoList?: Photo[];
}

@ObjectType()
class AddPhotoToShoppingBagResponse extends SuccessMessageResponse {
  @Field(() => ID, { nullable: true })
  addedPhotoWithId?: number;
}

@ObjectType()
class RemovePhotoFromShoppingBagResponse extends SuccessMessageResponse {
  @Field(() => ID, { nullable: true })
  removedPhotoWithId?: number;
}

@Resolver(() => User)
export default class UserResolver {
  //* Repositories
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Photo) private photoRepository: Repository<Photo>,
    @InjectRepository(UserShoppingBagItem)
    private userShoppingBagRepository: Repository<UserShoppingBagItem>
  ) {}

  // * GET SHOPPING BAG ITEMS
  @Authorized("USER")
  @Query(() => ShoppingBagItemsResponse, {
    description:
      "Returns all Photos in the shopping bag of the signed in User.",
  })
  async shoppingBagItems(
    @Ctx() context: Context
  ): Promise<ShoppingBagItemsResponse> {
    const userId = context.user.id;

    const shoppingBagItems = await this.userShoppingBagRepository.find({
      where: { userId: userId },
    });

    const photoIds = shoppingBagItems?.map((x) => x.photoId);
    let photos;

    if (photoIds.length > 0) {
      photos = await this.photoRepository
        .createQueryBuilder("p")
        .leftJoinAndSelect("p.images", "i")
        .leftJoinAndSelect("p.photographer", "pg")
        .leftJoinAndSelect("p.location", "l")
        .leftJoinAndSelect("p.subjectsInPhoto", "ps")
        .leftJoinAndSelect("ps.subject", "s", "ps.subjectId = s.id")
        .leftJoinAndSelect("p.tagsForPhoto", "pt")
        .leftJoinAndSelect("pt.tag", "t", "pt.tagId = t.id")
        .leftJoinAndSelect("p.collectionsForPhoto", "pc")
        .leftJoinAndSelect("pc.collection", "c", "pc.collectionId = c.id")
        .where("p.id IN (:...photoIds)", { photoIds: photoIds })
        .getMany();
    }

    return { photoList: photos };
  }

  // * Add
  @Authorized("USER")
  @Mutation(() => AddPhotoToShoppingBagResponse)
  async addPhotoToShoppingBag(
    @Ctx() context: Context,
    @Arg("photoId") photoId: number
  ): Promise<AddPhotoToShoppingBagResponse> {
    const userId = context.user.id;

    // * Check whether item is already in bag, return if it is
    const shoppingBagItem = await this.userShoppingBagRepository.findOne({
      where: { userId: userId, photoId: photoId },
    });

    if (shoppingBagItem) {
      return {
        success: false,
        message: `This photo is already in your shopping bag.`,
      };
    }

    // * get user & photo
    const user = await this.userRepository.findOne(userId);

    const photo = await this.photoRepository.findOne(photoId);

    if (!user) {
      return {
        success: false,
        message: `failed to find user with id ${userId}`,
      };
    }

    if (!photo) {
      return {
        success: false,
        message: `failed to find photo with id ${photoId}`,
      };
    }

    const newItem = await this.userShoppingBagRepository
      .create({
        userId: userId,
        photoId: photoId,
      })
      .save();

    if (newItem) {
      return {
        success: true,
        message: `Added ${photo.title} to your shopping bag.`,
        addedPhotoWithId: photoId,
      };
    }

    return {
      success: false,
      message: `Failed to add ${photo.title} to your shopping bag.`,
    };
  }

  // * Remove
  @Authorized("USER")
  @Mutation(() => RemovePhotoFromShoppingBagResponse)
  async removePhotoFromShoppingBag(
    @Ctx() context: Context,
    @Arg("photoId") photoId: number
  ): Promise<RemovePhotoFromShoppingBagResponse> {
    const userId = context.user.id;

    // * check to see whether UserShoppingBagItem exists
    const userShoppingBagItem = await this.userShoppingBagRepository.findOne({
      where: { userId: userId, photoId: photoId },
    });

    if (!userShoppingBagItem) {
      return {
        success: false,
        message: `Photo is not in your shopping bag.`,
      };
    }

    await this.userShoppingBagRepository.remove(userShoppingBagItem);

    return {
      success: true,
      message: `Successfully removed photo from your shopping bag.`,
      removedPhotoWithId: photoId,
    };
  }
}
