"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const apollo_server_express_1 = require("apollo-server-express");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const type_graphql_1 = require("type-graphql");
const typedi_1 = require("typedi");
const typeorm_1 = require("typeorm");
const User_1 = __importDefault(require("./entities/User"));
const Account_1 = __importDefault(require("./entities/Account"));
const auth_checker_1 = require("./auth-checker");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const PORT = process.env.PORT;
const getUser = (token) => __awaiter(void 0, void 0, void 0, function* () {
    const decodedToken = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
    if (decodedToken.userId) {
        return yield User_1.default.findOne({ id: decodedToken.userId });
    }
    else {
        console.error(`REQUEST HAS TEMPORARY JWT TOKEN.`);
        const account = yield Account_1.default.findOne({
            where: {
                providerId: decodedToken.providerId,
                providerAccountId: decodedToken.providerAccountId,
            },
        });
        if (account) {
            const user = yield User_1.default.findOne({ id: account.userId });
            return user;
        }
        else {
            throw new Error(`Can't find user in database.`);
        }
    }
});
const getOptions = () => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`getting DB options`);
    let connectionOptions;
    connectionOptions = {
        type: "postgres",
        synchronize: true,
        logging: false,
        extra: {
            ssl: true,
        },
        entities: ["dist/entities/*.*"],
    };
    if (process.env.DATABASE_URL) {
        Object.assign(connectionOptions, { url: process.env.DATABASE_URL });
        console.info(`took url from ${process.env.DATABASE_URL}`);
    }
    else {
        connectionOptions = yield typeorm_1.getConnectionOptions();
    }
    return connectionOptions;
});
const connect2Database = () => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`Connecting to DB`);
    const typeormconfig = yield getOptions();
    yield typeorm_1.createConnection(typeormconfig);
});
connect2Database().then(() => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Connected to database");
}));
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    typeorm_1.useContainer(typedi_1.Container);
    const schema = yield type_graphql_1.buildSchema({
        resolvers: [
            __dirname + "/modules/**/*.resolver.{ts,js}",
            __dirname + "/resolvers/**/*.{ts,js}",
        ],
        emitSchemaFile: {
            path: __dirname + "/schema.gql",
            commentDescriptions: true,
            sortedSchema: false,
        },
        container: typedi_1.Container,
        authChecker: auth_checker_1.authChecker,
    });
    const apolloServer = new apollo_server_express_1.ApolloServer({
        schema,
        introspection: true,
        playground: true,
        context: ({ req }) => __awaiter(void 0, void 0, void 0, function* () {
            let user;
            if (req.headers.authorization &&
                req.headers.authorization.split(" ")[0] === "Bearer") {
                const token = req.headers.authorization.split(" ")[1];
                console.log(`token: ${JSON.stringify(token, null, 2)}`);
                user = yield getUser(token);
            }
            return { req, user };
        }),
    });
    const app = express_1.default();
    app.use(cors_1.default({
        credentials: true,
        origin: "gp-app.vercel.app",
    }));
    apolloServer.applyMiddleware({ path: "/", app });
    app.listen(PORT, () => {
        console.log(`Server stated on localhost ${PORT}/api`);
    });
});
main();
//# sourceMappingURL=index.js.map