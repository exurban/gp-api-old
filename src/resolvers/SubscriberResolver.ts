import { InjectRepository } from "typeorm-typedi-extensions";
import { Repository } from "typeorm";
import User from "../entities/User";
import SuccessMessageResponse from "../abstract/SuccessMessageResponse";
import { Authorized, Ctx, Mutation, Resolver } from "type-graphql";

interface Context {
  user: User;
}

@Resolver(() => User)
export default class UserResolver {
  //* Repositories
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>
  ) {}

  @Authorized("USER")
  @Mutation(() => SuccessMessageResponse)
  async subscribeToNewsletter(
    @Ctx() context: Context
  ): Promise<SuccessMessageResponse> {
    const userId = context.user.id;
    const newSubscriber = await this.userRepository.findOne(userId);

    if (!newSubscriber) {
      return {
        success: false,
        message: "failed to find user ${userId} in database.",
      };
    }

    newSubscriber.isSubscribed = true;
    const saveResult = await newSubscriber.save();
    console.log(saveResult);

    if (saveResult) {
      return {
        success: true,
        message: "successfully subscribed to newsletter",
      };
    }
    return {
      success: false,
      message: "found user, but failed to save subscription request",
    };
  }

  @Authorized("USER")
  @Mutation(() => SuccessMessageResponse)
  async unsubscribeFromNewsletter(
    @Ctx() context: Context
  ): Promise<SuccessMessageResponse> {
    const userId = context.user.id;
    const updatedUser = await User.findOne(userId);
    if (!updatedUser) {
      return {
        success: false,
        message: "user ${userId} not found. failed to unsubscribe",
      };
    }
    updatedUser.isSubscribed = false;
    const saveResult = await updatedUser.save();

    if (saveResult) {
      return {
        success: true,
        message: "successfully unsubscribed from newsletter",
      };
    }
    return {
      success: false,
      message: "user found but failed to unsubscribe--${saveResult}",
    };
  }
}
