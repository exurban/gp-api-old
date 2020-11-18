import {
  Arg,
  Authorized,
  Ctx,
  Field,
  InputType,
  Int,
  Mutation,
  Query,
  Resolver,
} from "type-graphql";
import jwt from "jsonwebtoken";
import { InjectRepository } from "typeorm-typedi-extensions";
import { Repository } from "typeorm";
import * as dotenv from "dotenv";
dotenv.config();

import User from "../entities/User";
import UserFavorite from "../entities/UserFavorite";
import UserShoppingBagItem from "../entities/UserShoppingBagItem";

interface Context {
  user: User;
}

@InputType()
class GetApiTokenInput {
  @Field()
  userId: number;

  @Field()
  email: string;
}

/** ? Mutations
 * subscribe to newsletter
 * add to favorites
 * remove from favorites
 * add to shopping bag
 * remove from shopping bag
 * add to purchases
 *  */

//! TODO: make sure first time users can log in
// this might be a problem now bc DB isn't set up, but right now, I can't log in for the first time BC there's no user in the DB.

/** Queries
 * users
 * user(id)
 * newsletterSubscribers
 */

@Resolver(() => User)
export default class UserResolver {
  //* Repositories
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    // @InjectRepository(Photo) private photoRepository: Repository<Photo>,
    @InjectRepository(UserFavorite)
    private userFavoriteRepository: Repository<UserFavorite>,
    @InjectRepository(UserShoppingBagItem)
    private userShoppingBagRepository: Repository<UserShoppingBagItem>
  ) {}

  //* Queries
  // make this a query builder query
  @Authorized("ADMIN")
  @Query(() => [User])
  async users(): Promise<User[]> {
    return await this.userRepository.find({
      relations: [
        "userFavorites",
        "userFavorites.photo",
        "userShoppingBagItems",
        "userShoppingBagItems.photo",
      ],
    });
  }

  @Authorized("ADMIN")
  @Query(() => User)
  async user(@Arg("id", () => Int) id: number): Promise<User | undefined> {
    return await this.userRepository.findOne(id, {
      relations: ["userFavorites.count", "userShoppingBagItems.count"],
    });
  }

  @Query(() => [User])
  async userSummaries(): Promise<[User[], number]> {
    return await this.userRepository.findAndCount({
      relations: ["userFavorites", "userShoppingBagItems"],
    });
  }

  @Authorized("USER")
  @Query(() => [UserFavorite])
  async getUserFavorites(
    @Ctx() context: Context
  ): Promise<UserFavorite[] | undefined> {
    const userId = context.user.id;
    return await this.userFavoriteRepository.find({
      where: { userId: userId },
      relations: [
        "photo",
        "photo.location",
        "photo.photographer",
        "photo.images",
        "photo.tagsForPhoto",
        "photo.tagsForPhoto.tag",
        "photo.subjectsInPhoto",
        "photo.subjectsInPhoto.subject",
        "photo.collectionsForPhoto",
        "photo.collectionsForPhoto.collection",
      ],
    });
  }

  @Authorized("ADMIN")
  @Query(() => [User])
  async newsletterSubscribers(): Promise<User[]> {
    return await this.userRepository.find({ where: { isSubscribed: true } });
  }

  @Mutation(() => String)
  async getApiToken(
    @Arg("input", () => GetApiTokenInput) input: GetApiTokenInput
  ): Promise<string> {
    console.log(`received Get API Token request`);
    // look up compoundId, get its user and check that the email uses the one sent
    const user = await this.userRepository.findOne(input.userId);

    // * verify email
    if (user && user.email === input.email) {
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
        },
        process.env.JWT_SECRET as string
      );

      console.log(`Sending token to user already in DB.`);
      return token;
    } else {
      throw new Error(`Sign in credentials don't match.`);
    }
  }

  @Authorized("USER")
  @Mutation(() => Boolean)
  async subscribeToNewsletter(@Ctx() context: Context): Promise<boolean> {
    const userId = context.user.id;
    const updatedUser = await User.findOne(userId);
    console.log(`subscribing to newsletter`);
    if (!updatedUser) throw new Error("User not found!");
    Object.assign(updatedUser, { isSubscribed: true });
    await updatedUser.save();
    return true;
  }

  @Authorized("USER")
  @Mutation(() => Boolean)
  async unsubscribeFromNewsletter(@Ctx() context: Context) {
    const updatedUser = await User.findOne({
      where: { id: context.user.id },
    });
    if (!updatedUser) throw new Error("User not found!");
    Object.assign(updatedUser, { isSubscribed: false });
    await updatedUser.save();
    return updatedUser;
  }

  // * FAVORITES
  @Authorized("USER")
  @Mutation(() => Boolean)
  async addPhotoToFavorites(
    @Ctx() context: Context,
    @Arg("photoId") photoId: number
  ): Promise<boolean | undefined> {
    const userId = context.user.id;

    //* check to see whether UserFavorite already exists
    const userFavorite = await this.userFavoriteRepository.findOne({
      where: { userId: userId, photoId: photoId },
    });

    let result = false;

    if (userFavorite) {
      throw new Error(
        `${context.user.name} has already added this photo to their favorites.`
      );
    } else {
      try {
        this.userFavoriteRepository
          .create({
            userId: userId,
            photoId: photoId,
          })
          .save();
        result = true;
      } catch {
        throw new Error(`Failed to add photo to user's favorites.`);
      }
    }
    return result;
  }

  @Authorized("USER")
  @Mutation(() => Boolean)
  async removePhotoFromFavorites(
    @Ctx() context: Context,
    @Arg("photoId") photoId: number
  ): Promise<boolean> {
    const userId = context.user.id;

    //* check to see whether UserFavorite already exists
    const userFavorite = await this.userFavoriteRepository.findOne({
      where: { userId: userId, photoId: photoId },
    });

    if (!userFavorite) {
      throw new Error(`Photo is not in ${context.user.name}'s favorites.`);
    } else {
      const deleteResult = await this.userFavoriteRepository.delete(
        userFavorite
      );
      if (deleteResult && deleteResult.affected != 0) {
        return true;
      }
      return false;
    }
  }

  @Authorized("USER")
  @Mutation(() => Boolean)
  async toggleUserFavorite(
    @Ctx() context: Context,
    @Arg("photoId") photoId: number
  ): Promise<boolean> {
    const userId = context.user.id;

    const userFavorite = await this.userFavoriteRepository.findOne({
      userId: userId,
      photoId: photoId,
    });

    if (userFavorite) {
      const deleteResult = await this.userFavoriteRepository.delete(
        userFavorite
      );
      if (deleteResult && deleteResult.affected != 0) {
        return true;
      }
      return false;
    } else {
      try {
        this.userFavoriteRepository.create({
          photoId: photoId,
          userId: userId,
        });
        return true;
      } catch {
        throw new Error(`Failed to add photo to user's favorites.`);
      } finally {
        return false;
      }
    }
  }

  @Authorized("USER")
  @Mutation(() => Boolean)
  async addPhotoToShoppingBag(
    @Ctx() context: Context,
    @Arg("photoId") photoId: number
  ): Promise<boolean> {
    const userId = context.user.id;

    const userShoppingBagItem = await this.userShoppingBagRepository.findOne({
      where: { userId: userId, photoId: photoId },
    });
    try {
      this.userShoppingBagRepository.create(
        userShoppingBagItem as UserShoppingBagItem
      );
      return true;
    } catch {
      throw new Error(`Failed to add photo to user's shopping bag.`);
    }
  }

  @Authorized("USER")
  @Mutation(() => Boolean)
  async removePhotoFromShoppingBag(
    @Ctx() context: Context,
    @Arg("photoId") photoId: number
  ): Promise<boolean> {
    const userId = context.user.id;

    const userShoppingBagItem = await this.userShoppingBagRepository.findOne({
      where: { userId: userId, photoId: photoId },
    });
    try {
      this.userShoppingBagRepository.delete(
        userShoppingBagItem as UserShoppingBagItem
      );
      return true;
    } catch {
      throw new Error(`Failed to remove photo from user's shopping bag.`);
    }
  }
}
