import { AuthChecker } from "type-graphql";
import User from "./entities/User";

interface Context {
  user?: User;
}

export const authChecker: AuthChecker<Context> = (
  { context: { user } },
  roles
) => {
  // console.log(
  //   `In authChecker ${JSON.stringify(
  //     user?.roles,
  //     null,
  //     2
  //   )} is of type ${typeof user?.roles} has length ${user?.roles.length}`
  // );
  if (roles.length === 0) {
    return user !== undefined;
  }

  if (!user) {
    return false;
  }

  if (user.roles.some((role) => roles.includes(role))) {
    console.log(`Checking role: ${roles}`);
    return true;
  }

  return false;
};
