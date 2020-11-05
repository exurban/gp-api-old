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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
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
const type_graphql_1 = require("type-graphql");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const typeorm_typedi_extensions_1 = require("typeorm-typedi-extensions");
const typeorm_1 = require("typeorm");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const User_1 = __importDefault(require("../entities/User"));
const Account_1 = __importDefault(require("../entities/Account"));
const UserFavorite_1 = __importDefault(require("../entities/UserFavorite"));
const UserShoppingBagItem_1 = __importDefault(require("../entities/UserShoppingBagItem"));
let GetApiTokenInput = class GetApiTokenInput {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], GetApiTokenInput.prototype, "email", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], GetApiTokenInput.prototype, "providerId", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], GetApiTokenInput.prototype, "providerAccountId", void 0);
GetApiTokenInput = __decorate([
    type_graphql_1.InputType()
], GetApiTokenInput);
let UserResolver = class UserResolver {
    constructor(userRepository, userFavoriteRepository, userShoppingBagRepository) {
        this.userRepository = userRepository;
        this.userFavoriteRepository = userFavoriteRepository;
        this.userShoppingBagRepository = userShoppingBagRepository;
    }
    users() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.userRepository.find({
                relations: [
                    "userFavorites",
                    "userFavorites.photo",
                    "userShoppingBagItems",
                    "userShoppingBagItems.photo",
                ],
            });
        });
    }
    userSummaries() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.userRepository.findAndCount({
                relations: ["userFavorites", "userShoppingBagItems"],
            });
        });
    }
    user(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.userRepository.findOne(id, {
                relations: ["userFavorites.count", "userShoppingBagItems.count"],
            });
        });
    }
    newsletterSubscribers() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.userRepository.find({ where: { isSubscribed: true } });
        });
    }
    getApiToken(input) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`received Get API Token request`);
            const account = yield Account_1.default.findOne({
                where: {
                    providerId: input.providerId,
                    providerAccountId: input.providerAccountId,
                },
            });
            if (account) {
                const user = yield User_1.default.findOne({ id: account.userId });
                if (user && user.email === input.email) {
                    const token = jsonwebtoken_1.default.sign({ userId: account.userId }, process.env.JWT_SECRET);
                    console.log(`Sending token to user already in DB.`);
                    return token;
                }
                else {
                    throw new Error(`Sign in credentials don't match.`);
                }
            }
            else {
                const payload = {
                    email: input.email,
                    providerId: input.providerId,
                    providerAccountId: input.providerAccountId,
                };
                const token = yield jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET);
                console.log(`Sending temporary JWT token to new user.`);
                return token;
            }
        });
    }
    subscribeToNewsletter(context) {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = context.user.id;
            const updatedUser = yield User_1.default.findOne(userId);
            console.log(`subscribing to newsletter`);
            if (!updatedUser)
                throw new Error("User not found!");
            Object.assign(updatedUser, { isSubscribed: true });
            yield updatedUser.save();
            return true;
        });
    }
    unsubscribeFromNewsletter(context) {
        return __awaiter(this, void 0, void 0, function* () {
            const updatedUser = yield User_1.default.findOne({
                where: { id: context.user.id },
            });
            if (!updatedUser)
                throw new Error("User not found!");
            Object.assign(updatedUser, { isSubscribed: false });
            yield updatedUser.save();
            return updatedUser;
        });
    }
    addPhotoToFavorites(context, photoId) {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = context.user.id;
            const userFavorite = yield this.userFavoriteRepository.findOne({
                where: { userId: userId, photoId: photoId },
            });
            let result = false;
            if (userFavorite) {
                throw new Error(`${context.user.name} has already added this photo to their favorites.`);
            }
            else {
                try {
                    this.userFavoriteRepository
                        .create({
                        userId: userId,
                        photoId: photoId,
                    })
                        .save();
                    result = true;
                }
                catch (_a) {
                    throw new Error(`Failed to add photo to user's favorites.`);
                }
            }
            return result;
        });
    }
    removePhotoFromFavorites(context, photoId) {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = context.user.id;
            const userFavorite = yield this.userFavoriteRepository.findOne({
                where: { userId: userId, photoId: photoId },
            });
            if (!userFavorite) {
                throw new Error(`Photo is not in ${context.user.name}'s favorites.`);
            }
            else {
                const deleteResult = yield this.userFavoriteRepository.delete(userFavorite);
                if (deleteResult && deleteResult.affected != 0) {
                    return true;
                }
                return false;
            }
        });
    }
    toggleUserFavorite(context, photoId) {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = context.user.id;
            const userFavorite = yield this.userFavoriteRepository.findOne({
                userId: userId,
                photoId: photoId,
            });
            if (userFavorite) {
                const deleteResult = yield this.userFavoriteRepository.delete(userFavorite);
                if (deleteResult && deleteResult.affected != 0) {
                    return true;
                }
                return false;
            }
            else {
                try {
                    this.userFavoriteRepository.create({
                        photoId: photoId,
                        userId: userId,
                    });
                    return true;
                }
                catch (_a) {
                    throw new Error(`Failed to add photo to user's favorites.`);
                }
                finally {
                    return false;
                }
            }
        });
    }
    addPhotoToShoppingBag(context, photoId) {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = context.user.id;
            const userShoppingBagItem = yield this.userShoppingBagRepository.findOne({
                where: { userId: userId, photoId: photoId },
            });
            try {
                this.userShoppingBagRepository.create(userShoppingBagItem);
                return true;
            }
            catch (_a) {
                throw new Error(`Failed to add photo to user's shopping bag.`);
            }
        });
    }
    removePhotoFromShoppingBsg(context, photoId) {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = context.user.id;
            const userShoppingBagItem = yield this.userShoppingBagRepository.findOne({
                where: { userId: userId, photoId: photoId },
            });
            try {
                this.userShoppingBagRepository.delete(userShoppingBagItem);
                return true;
            }
            catch (_a) {
                throw new Error(`Failed to remove photo from user's shopping bag.`);
            }
        });
    }
};
__decorate([
    type_graphql_1.Authorized("ADMIN"),
    type_graphql_1.Query(() => [User_1.default]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "users", null);
__decorate([
    type_graphql_1.Query(() => [User_1.default]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "userSummaries", null);
__decorate([
    type_graphql_1.Authorized("ADMIN"),
    type_graphql_1.Query(() => [User_1.default]),
    __param(0, type_graphql_1.Arg("id", () => type_graphql_1.Int)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "user", null);
__decorate([
    type_graphql_1.Authorized("ADMIN"),
    type_graphql_1.Query(() => [User_1.default]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "newsletterSubscribers", null);
__decorate([
    type_graphql_1.Mutation(() => String),
    __param(0, type_graphql_1.Arg("input", () => GetApiTokenInput)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [GetApiTokenInput]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "getApiToken", null);
__decorate([
    type_graphql_1.Authorized("USER"),
    type_graphql_1.Mutation(() => Boolean),
    __param(0, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "subscribeToNewsletter", null);
__decorate([
    type_graphql_1.Authorized("USER"),
    type_graphql_1.Mutation(() => Boolean),
    __param(0, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "unsubscribeFromNewsletter", null);
__decorate([
    type_graphql_1.Authorized("USER"),
    type_graphql_1.Mutation(() => Boolean),
    __param(0, type_graphql_1.Ctx()),
    __param(1, type_graphql_1.Arg("photoId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "addPhotoToFavorites", null);
__decorate([
    type_graphql_1.Authorized("USER"),
    type_graphql_1.Mutation(() => Boolean),
    __param(0, type_graphql_1.Ctx()),
    __param(1, type_graphql_1.Arg("photoId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "removePhotoFromFavorites", null);
__decorate([
    type_graphql_1.Authorized("USER"),
    type_graphql_1.Mutation(() => Boolean),
    __param(0, type_graphql_1.Ctx()),
    __param(1, type_graphql_1.Arg("photoId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "toggleUserFavorite", null);
__decorate([
    type_graphql_1.Authorized("USER"),
    type_graphql_1.Mutation(() => Boolean),
    __param(0, type_graphql_1.Ctx()),
    __param(1, type_graphql_1.Arg("photoId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "addPhotoToShoppingBag", null);
__decorate([
    type_graphql_1.Authorized("USER"),
    type_graphql_1.Mutation(() => Boolean),
    __param(0, type_graphql_1.Ctx()),
    __param(1, type_graphql_1.Arg("photoId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "removePhotoFromShoppingBsg", null);
UserResolver = __decorate([
    type_graphql_1.Resolver(() => User_1.default),
    __param(0, typeorm_typedi_extensions_1.InjectRepository(User_1.default)),
    __param(1, typeorm_typedi_extensions_1.InjectRepository(UserFavorite_1.default)),
    __param(2, typeorm_typedi_extensions_1.InjectRepository(UserShoppingBagItem_1.default)),
    __metadata("design:paramtypes", [typeorm_1.Repository,
        typeorm_1.Repository,
        typeorm_1.Repository])
], UserResolver);
exports.default = UserResolver;
//# sourceMappingURL=UserResolver.js.map