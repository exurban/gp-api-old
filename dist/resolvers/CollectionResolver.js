"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
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
const typeorm_1 = require("typeorm");
const typeorm_typedi_extensions_1 = require("typeorm-typedi-extensions");
const Collection_1 = __importDefault(require("../entities/Collection"));
let CollectionInput = class CollectionInput {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], CollectionInput.prototype, "name", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], CollectionInput.prototype, "tag", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], CollectionInput.prototype, "description", void 0);
CollectionInput = __decorate([
    type_graphql_1.InputType()
], CollectionInput);
let CollectionUpdateInput = class CollectionUpdateInput {
};
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", String)
], CollectionUpdateInput.prototype, "name", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", String)
], CollectionUpdateInput.prototype, "tag", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", String)
], CollectionUpdateInput.prototype, "description", void 0);
CollectionUpdateInput = __decorate([
    type_graphql_1.InputType()
], CollectionUpdateInput);
let CollectionResolver = class CollectionResolver {
    constructor(collectionRepository) {
        this.collectionRepository = collectionRepository;
    }
    collections() {
        return __awaiter(this, void 0, void 0, function* () {
            const collections = yield Collection_1.default.find({
                relations: ["photosInCollection", "photosInCollection.photo"],
            });
            console.log(`collections: ${JSON.stringify(collections, null, 2)}`);
            return collections;
        });
    }
    collection(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const coll = yield Collection_1.default.findOne(id, {
                relations: ["photosInCollection", "photosInCollection.photo"],
            });
            console.log(`collection: ${JSON.stringify(coll, null, 2)}`);
            return coll;
        });
    }
    addCollection(input) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.collectionRepository.create(input).save();
        });
    }
    updateCollection(id, input) {
        return __awaiter(this, void 0, void 0, function* () {
            const collection = yield this.collectionRepository.findOne(id);
            if (!collection) {
                throw new Error(`No collection with an id of ${id} exists.`);
            }
            yield this.collectionRepository.update(id, Object.assign({}, input));
            const updatedCollection = yield this.collectionRepository.findOne(id);
            return updatedCollection;
        });
    }
    deleteCollection(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const deleteResult = yield this.collectionRepository.delete({ id });
            if (deleteResult && deleteResult.affected != 0) {
                return true;
            }
            return false;
        });
    }
};
__decorate([
    type_graphql_1.Query(() => [Collection_1.default]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CollectionResolver.prototype, "collections", null);
__decorate([
    type_graphql_1.Query(() => Collection_1.default),
    __param(0, type_graphql_1.Arg("id", () => type_graphql_1.Int)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], CollectionResolver.prototype, "collection", null);
__decorate([
    type_graphql_1.Authorized("ADMIN"),
    type_graphql_1.Mutation(() => Collection_1.default),
    __param(0, type_graphql_1.Arg("input", () => CollectionInput)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CollectionInput]),
    __metadata("design:returntype", Promise)
], CollectionResolver.prototype, "addCollection", null);
__decorate([
    type_graphql_1.Authorized("ADMIN"),
    type_graphql_1.Mutation(() => Collection_1.default),
    __param(0, type_graphql_1.Arg("id", () => type_graphql_1.Int)),
    __param(1, type_graphql_1.Arg("input", () => CollectionUpdateInput)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, CollectionUpdateInput]),
    __metadata("design:returntype", Promise)
], CollectionResolver.prototype, "updateCollection", null);
__decorate([
    type_graphql_1.Authorized("ADMIN"),
    type_graphql_1.Mutation(() => Boolean),
    __param(0, type_graphql_1.Arg("id", () => type_graphql_1.Int)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], CollectionResolver.prototype, "deleteCollection", null);
CollectionResolver = __decorate([
    type_graphql_1.Resolver(() => Collection_1.default),
    __param(0, typeorm_typedi_extensions_1.InjectRepository(Collection_1.default)),
    __metadata("design:paramtypes", [typeorm_1.Repository])
], CollectionResolver);
exports.default = CollectionResolver;
//# sourceMappingURL=CollectionResolver.js.map