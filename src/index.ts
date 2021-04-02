import "reflect-metadata";
import { ApolloServer } from "apollo-server-express";
import express from "express";

import jwt from "jsonwebtoken";
import { buildSchema } from "type-graphql";
import { Container } from "typedi";
import { createConnection, useContainer } from "typeorm";
import { SnakeNamingStrategy } from "typeorm-naming-strategies";
import { authChecker } from "./auth-checker";

import User from "./entities/User";
import * as dotenv from "dotenv";

import bodyParser from "body-parser";
import Stripe from "stripe";

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2020-08-27",
});
// const webhookSecret: string = process.env.STRIPE_WEBHOOK_SIGNING_SECRET;
const webhookSecret = "whsec_4LGsxs9oeTjgCe6wJaquBWf8o3WQACwz";

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

const connectToRemoteDB = async () => {
  console.log(`connecting to remote at ${process.env.DATABASE_URL}`);
  const connection = await createConnection({
    type: "postgres",
    synchronize: true,
    logging: false,
    namingStrategy: new SnakeNamingStrategy(),
    name: "default",
    url: process.env.DATABASE_URL,
    ssl: true,
    extra: {
      ssl: {
        rejectUnauthorized: false,
      },
    },
    entities: ["dist/entities/*{.ts,.js}"],
  });

  if (connection) {
    console.log(`Connected to remote db.`);
  }
};

// const connectToLocalDB = async () => {
//   console.log(`connecting to local db`);
//   const connection = await createConnection({
//     type: "postgres",
//     synchronize: true,
//     logging: false,
//     namingStrategy: new SnakeNamingStrategy(),
//     name: "default",
//     host: "localhost",
//     port: 5432,
//     username: "postgres",
//     password: "postgres",
//     database: "photos",
//     entities: ["entities/*{.ts,.js}", "dist/entities/*{.ts,.js}"],
//   });

//   if (connection) {
//     console.log(`Connected to local db.`);
//   }
// };

const main = async () => {
  // * Connect to Database
  useContainer(Container);

  // await connectToLocalDB();
  await connectToRemoteDB();

  const schema = await buildSchema({
    resolvers: [__dirname + "/resolvers/**/*.{ts,js}"],
    // resolvers: [__dirname + "/resolvers/*.{ts,js}"],
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

  const app = express();

  // Use JSON parser for all non-webhook routes
  app.use(
    (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ): void => {
      if (req.originalUrl === "/webhook") {
        next();
      } else {
        bodyParser.json()(req, res, next);
      }
    }
  );

  app.post(
    "/webhook",
    // Stripe requires the raw body to construct the event
    bodyParser.raw({ type: "application/json" }),
    (req: express.Request, res: express.Response): void => {
      console.log(`incoming...`);
      const sig = req.headers["stripe-signature"];

      let event: Stripe.Event;

      try {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        event = stripe.webhooks.constructEvent(req.body, sig!, webhookSecret);
      } catch (err) {
        // On error, log and return the error message
        console.log(`❌ Error message: ${err.message}`);
        res.status(400).send(`Webhook Error: ${err.message}`);
        return;
      }

      // Successfully constructed event
      console.log("✅ Success:", event.id);

      if (event.type === "checkout.session.completed") {
        const stripeObject: Stripe.Checkout.Session = event.data
          .object as Stripe.Checkout.Session;
        console.log(`Checkout Session: ${stripeObject.line_items}`);
      }

      // // Cast event data to Stripe object
      // if (event.type === "payment_intent.succeeded") {
      //   const stripeObject: Stripe.PaymentIntent = event.data
      //     .object as Stripe.PaymentIntent;
      //   console.log(`💰 PaymentIntent status: ${stripeObject.status}`);
      // } else if (event.type === "charge.succeeded") {
      //   const charge = event.data.object as Stripe.Charge;
      //   console.log(`💵 Charge id: ${charge.id}`);
      // } else {
      //   console.warn(`🤷‍♀️ Unhandled event type: ${event.type}`);
      // }

      // Return a response to acknowledge receipt of the event
      res.json({ received: true });
    }
  );

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
