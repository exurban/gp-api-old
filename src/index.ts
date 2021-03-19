import "reflect-metadata";
import { ApolloServer } from "apollo-server-express";
import Express from "express";
// import cors from "cors";
import jwt from "jsonwebtoken";
import { buildSchema } from "type-graphql";
import { Container } from "typedi";
import { ConnectionOptions, createConnection, useContainer } from "typeorm";
import { SnakeNamingStrategy } from "typeorm-naming-strategies";
import { authChecker } from "./auth-checker";
import Stripe from "stripe";

// import Account from "./entities/Account";
import User from "./entities/User";
import * as dotenv from "dotenv";

if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

const PORT = process.env.PORT;

interface ITokenPayload {
  id: number;
  email: string;
  iat: number;
}

// get the user info from a JWT token
const getUser = async (token: string): Promise<User | undefined> => {
  // verify token
  const decodedToken = jwt.verify(
    token,
    process.env.JWT_SECRET as jwt.Secret
  ) as ITokenPayload;
  if (decodedToken.id) {
    return await User.findOne({ id: decodedToken.id });
  } else {
    // user has a temp token after first signin. Let's replace it with a regular userId token
    console.error(`REQUEST HAS TEMPORARY JWT TOKEN.`);
  }
  return undefined;
};

const getOptions = async () => {
  console.log(`getting DB options`);
  const connectionOptions: ConnectionOptions = {
    type: "postgres",
    synchronize: true,
    logging: false,
    namingStrategy: new SnakeNamingStrategy(),
  };
  if (process.env.NODE_ENV === "production") {
    Object.assign(connectionOptions, {
      url: process.env.DATABASE_URL,
      entities: ["dist/entities/*{.ts,.js}"],
    });
  } else {
    Object.assign(connectionOptions, {
      name: "default",
      host: "localhost",
      port: 5432,
      username: "postgres",
      password: "postgres",
      database: "photos",
      entities: ["src/entities/*{.ts,.js}", "dist/entities/*{.ts,.js}"],
    });
  }

  return connectionOptions;
};

const connect2Database = async (): Promise<void> => {
  console.log(`Connecting to DB`);
  const typeormconfig = await getOptions();
  await createConnection(typeormconfig);
};

connect2Database().then(async () => {
  console.log("Connected to database");
});

const main = async () => {
  // * Connect to Database
  useContainer(Container);
  // await createConnection();

  const schema = await buildSchema({
    resolvers: [__dirname + "/resolvers/**/*.{ts,js}"],
    emitSchemaFile: {
      path: __dirname + "/schema.gql",
      commentDescriptions: true,
      sortedSchema: false,
    },
    container: Container,
    authChecker: authChecker,
  });

  const apolloServer = new ApolloServer({
    schema,
    introspection: true,
    playground: true,
    context: async ({ req }) => {
      let user;
      // console.log(`rec'd req with body: ${JSON.stringify(req.body, null, 2)}`);
      if (
        req.headers.authorization &&
        req.headers.authorization.split(" ")[0] === "Bearer"
      ) {
        const token = req.headers.authorization.split(" ")[1] as string;
        // console.log(`token: ${JSON.stringify(token, null, 2)}`);
        user = await getUser(token);
        // console.log(`put user on the context ${JSON.stringify(user, null, 2)}`);
      } else {
        // console.log(`No bearer token found in headers.`);
      }

      return { req, user };
    },
  });

  const app = Express();

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    // https://github.com/stripe/stripe-node#configuration
    apiVersion: "2020-08-27",
  });

  app.post("/create-checkout-session", async (_req, res) => {
    console.log(`request received.`);
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Image, 12 x 18, white mat, black metal frame",
            },
            unit_amount: 12000,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: "https://gibbs-photography.com/checkout/success",
      cancel_url: "https://gibbs-photography.com/checkout/cancel",
    });

    res.json({ id: session.id });
  });

  // const corsOptions = {
  //   origin: "http://localhost:3000",
  //   credentials: false,
  // };

  // const corsOptions = {
  //   origin: "https://gibbs-photography.com",
  //   credentials: false,
  // };

  // app.use(cors(corsOptions));

  apolloServer.applyMiddleware({ path: "/", app });

  // Ben Awad used cors: false in the video below. Not sure if I need it.
  // https://www.youtube.com/watch?v=izriJQeqGUA&list=PLN3n1USn4xlkDk8vPVtgyGG3_1eXYPrW-&index=3
  // apolloServer.applyMiddleware({ path: "/", app, cors: false });

  app.listen(PORT, () => {
    console.log(`Server stated on localhost:${PORT}/api`);
  });
};

main();
