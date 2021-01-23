import {
  Arg,
  Authorized,
  Ctx,
  Field,
  InputType,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from "type-graphql";
import jwt from "jsonwebtoken";
import { InjectRepository } from "typeorm-typedi-extensions";
import { Repository } from "typeorm";
import * as dotenv from "dotenv";
dotenv.config();

import User from "../../entities/User";
import UserFavorite from "../../entities/UserFavorite";
import UserShoppingBagItem from "../../entities/UserShoppingBagItem";

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

@ObjectType()
class UserPreferencesResponse {
  @Field(() => [UserFavorite], { nullable: true })
  favorites?: UserFavorite[];

  @Field(() => [UserShoppingBagItem], { nullable: true })
  shoppingBagItems?: UserShoppingBagItem[];
}

@Resolver(() => User)
export default class UserResolver {
  //* Repositories
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
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

  @Authorized("ADMIN")
  @Query(() => [User])
  async userSummaries(): Promise<[User[], number]> {
    return await this.userRepository.findAndCount({
      relations: ["userFavorites", "userShoppingBagItems"],
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
  @Query(() => UserPreferencesResponse)
  async getUserPreferences(
    @Ctx() context: Context
  ): Promise<UserPreferencesResponse> {
    const userId = context.user.id;

    // get photoIds in favorites
    const userFavorites = await this.userFavoriteRepository
      .createQueryBuilder("uf")
      .leftJoinAndSelect("uf.photo", "p")
      .leftJoinAndSelect("p.images", "i")
      .leftJoinAndSelect("p.photographer", "pg")
      .leftJoinAndSelect("p.location", "l")
      .leftJoinAndSelect("p.subjectsInPhoto", "ps")
      .leftJoinAndSelect("ps.subject", "s", "ps.subjectId = s.id")
      .leftJoinAndSelect("p.tagsForPhoto", "pt")
      .leftJoinAndSelect("pt.tag", "t", "pt.tagId = t.id")
      .leftJoinAndSelect("p.collectionsForPhoto", "pc")
      .leftJoinAndSelect("pc.collection", "c", "pc.collectionId = c.id")
      .where("uf.userId = :userId", { userId: userId })
      .getMany();

    // get photoIds in bag
    const userShoppingBagItems = await this.userShoppingBagRepository
      .createQueryBuilder("usbi")
      .leftJoinAndSelect("usbi.photo", "p")
      .leftJoinAndSelect("p.images", "i")
      .leftJoinAndSelect("p.photographer", "pg")
      .leftJoinAndSelect("p.location", "l")
      .leftJoinAndSelect("p.subjectsInPhoto", "ps")
      .leftJoinAndSelect("ps.subject", "s", "ps.subjectId = s.id")
      .leftJoinAndSelect("p.tagsForPhoto", "pt")
      .leftJoinAndSelect("pt.tag", "t", "pt.tagId = t.id")
      .leftJoinAndSelect("p.collectionsForPhoto", "pc")
      .leftJoinAndSelect("pc.collection", "c", "pc.collectionId = c.id")
      .where("usbi.userId = :userId", { userId: userId })
      .getMany();

    return {
      favorites: userFavorites,
      shoppingBagItems: userShoppingBagItems,
    };
  }
}
