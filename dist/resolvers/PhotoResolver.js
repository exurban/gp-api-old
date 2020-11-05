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
const Photo_1 = __importDefault(require("../entities/Photo"));
const PhotoCollection_1 = __importDefault(require("../entities/PhotoCollection"));
let PhotoInput = class PhotoInput {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], PhotoInput.prototype, "photoUrl", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", String)
], PhotoInput.prototype, "title", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", String)
], PhotoInput.prototype, "description", void 0);
__decorate([
    type_graphql_1.Field(() => [String]),
    __metadata("design:type", Array)
], PhotoInput.prototype, "subjects", void 0);
__decorate([
    type_graphql_1.Field(() => [String], { nullable: true }),
    __metadata("design:type", Array)
], PhotoInput.prototype, "tags", void 0);
__decorate([
    type_graphql_1.Field(() => Boolean, { nullable: true }),
    __metadata("design:type", Boolean)
], PhotoInput.prototype, "isFeatured", void 0);
__decorate([
    type_graphql_1.Field(() => Boolean, { nullable: true }),
    __metadata("design:type", Boolean)
], PhotoInput.prototype, "isLimitedEdition", void 0);
__decorate([
    type_graphql_1.Field(() => type_graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], PhotoInput.prototype, "rating", void 0);
__decorate([
    type_graphql_1.Field(() => type_graphql_1.Float),
    __metadata("design:type", Number)
], PhotoInput.prototype, "basePrice", void 0);
__decorate([
    type_graphql_1.Field(() => type_graphql_1.Float, { nullable: true }),
    __metadata("design:type", Number)
], PhotoInput.prototype, "priceModifier", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", Number)
], PhotoInput.prototype, "photographerId", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", Number)
], PhotoInput.prototype, "locationId", void 0);
PhotoInput = __decorate([
    type_graphql_1.InputType()
], PhotoInput);
let PhotoUpdateInput = class PhotoUpdateInput {
};
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", String)
], PhotoUpdateInput.prototype, "photoUrl", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", String)
], PhotoUpdateInput.prototype, "title", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", String)
], PhotoUpdateInput.prototype, "description", void 0);
__decorate([
    type_graphql_1.Field(() => [String], { nullable: true }),
    __metadata("design:type", Array)
], PhotoUpdateInput.prototype, "subjects", void 0);
__decorate([
    type_graphql_1.Field(() => [String], { nullable: true }),
    __metadata("design:type", Array)
], PhotoUpdateInput.prototype, "tags", void 0);
__decorate([
    type_graphql_1.Field(() => Boolean, { nullable: true }),
    __metadata("design:type", Boolean)
], PhotoUpdateInput.prototype, "discontinued", void 0);
__decorate([
    type_graphql_1.Field(() => Boolean, { nullable: true }),
    __metadata("design:type", Boolean)
], PhotoUpdateInput.prototype, "isFeatured", void 0);
__decorate([
    type_graphql_1.Field(() => Boolean, { nullable: true }),
    __metadata("design:type", Boolean)
], PhotoUpdateInput.prototype, "isLimitedEdition", void 0);
__decorate([
    type_graphql_1.Field(() => type_graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], PhotoUpdateInput.prototype, "rating", void 0);
__decorate([
    type_graphql_1.Field(() => type_graphql_1.Float, { nullable: true }),
    __metadata("design:type", Number)
], PhotoUpdateInput.prototype, "basePrice", void 0);
__decorate([
    type_graphql_1.Field(() => type_graphql_1.Float, { nullable: true }),
    __metadata("design:type", Number)
], PhotoUpdateInput.prototype, "priceModifier", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", Number)
], PhotoUpdateInput.prototype, "photographerId", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", Number)
], PhotoUpdateInput.prototype, "locationId", void 0);
PhotoUpdateInput = __decorate([
    type_graphql_1.InputType()
], PhotoUpdateInput);
let PhotoResolver = class PhotoResolver {
    constructor(photoRepository, photoCollectionRepository) {
        this.photoRepository = photoRepository;
        this.photoCollectionRepository = photoCollectionRepository;
    }
    photos() {
        return __awaiter(this, void 0, void 0, function* () {
            const photos = this.photoRepository.find({
                relations: [
                    "location",
                    "photographer",
                    "collectionsForPhoto",
                    "collectionsForPhoto.collection",
                ],
            });
            console.log(`photos: ${JSON.stringify(photos, null, 2)}`);
            return photos;
        });
    }
    featuredPhotos() {
        return __awaiter(this, void 0, void 0, function* () {
            const photos = this.photoRepository.find({
                where: { isFeatured: true },
                relations: [
                    "location",
                    "photographer",
                    "collectionsForPhoto",
                    "collectionsForPhoto.collection",
                    "images",
                    "tagsForPhoto",
                    "tagsForPhoto.tag",
                    "subjectsInPhoto",
                    "subjectsInPhoto.subject",
                ],
            });
            return photos;
        });
    }
    photo(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const photo = yield this.photoRepository.findOne(id, {
                relations: [
                    "location",
                    "photographer",
                    "collectionsForPhoto",
                    "collectionsForPhoto.collection",
                ],
            });
            console.log(`photo: ${JSON.stringify(photo, null, 2)}`);
            return photo;
        });
    }
    addPhoto(input) {
        return __awaiter(this, void 0, void 0, function* () {
            const newPhoto = this.photoRepository.create(Object.assign({}, input));
            yield this.photoRepository.insert(newPhoto);
            yield this.photoRepository.save(newPhoto);
            return newPhoto;
        });
    }
    updatePhoto(id, input) {
        return __awaiter(this, void 0, void 0, function* () {
            const photo = yield this.photoRepository.findOne({ id });
            if (!photo) {
                throw new Error(`No photo with an id of ${id} exists.`);
            }
            else {
                const updatedPhoto = Object.assign(Object.assign({}, photo), input);
                yield this.photoRepository.save(updatedPhoto);
            }
            return photo;
        });
    }
    deletePhoto(id) {
        return __awaiter(this, void 0, void 0, function* () {
            let result = true;
            yield this.photoCollectionRepository.delete({ photoId: id });
            const deleteResult = yield this.photoRepository.delete({ id });
            if (!deleteResult || deleteResult.affected == 0) {
                result = false;
                throw new Error(`Failed to delete photo.`);
            }
            return result;
        });
    }
    addPhotoToCollection(photoId, collectionId) {
        return __awaiter(this, void 0, void 0, function* () {
            const photoCollection = yield this.photoCollectionRepository.create({
                photoId: photoId,
                collectionId: collectionId,
            });
            yield this.photoCollectionRepository.save(photoCollection);
            return true;
        });
    }
    removePhotoFromCollection(photoId, collectionId) {
        return __awaiter(this, void 0, void 0, function* () {
            const deleteResult = yield this.photoCollectionRepository.delete({
                photoId: photoId,
                collectionId: collectionId,
            });
            if (deleteResult && deleteResult.affected != 0) {
                return true;
            }
            return false;
        });
    }
};
__decorate([
    type_graphql_1.Query(() => [Photo_1.default]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PhotoResolver.prototype, "photos", null);
__decorate([
    type_graphql_1.Query(() => [Photo_1.default]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PhotoResolver.prototype, "featuredPhotos", null);
__decorate([
    type_graphql_1.Query(() => Photo_1.default),
    __param(0, type_graphql_1.Arg("id", () => type_graphql_1.Int)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], PhotoResolver.prototype, "photo", null);
__decorate([
    type_graphql_1.Authorized("ADMIN"),
    type_graphql_1.Mutation(() => Photo_1.default),
    __param(0, type_graphql_1.Arg("input", () => PhotoInput)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [PhotoInput]),
    __metadata("design:returntype", Promise)
], PhotoResolver.prototype, "addPhoto", null);
__decorate([
    type_graphql_1.Authorized("ADMIN"),
    type_graphql_1.Mutation(() => Photo_1.default),
    __param(0, type_graphql_1.Arg("id", () => type_graphql_1.Int)),
    __param(1, type_graphql_1.Arg("input", () => PhotoUpdateInput)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, PhotoUpdateInput]),
    __metadata("design:returntype", Promise)
], PhotoResolver.prototype, "updatePhoto", null);
__decorate([
    type_graphql_1.Authorized("ADMIN"),
    type_graphql_1.Mutation(() => Boolean),
    __param(0, type_graphql_1.Arg("id", () => type_graphql_1.Int)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], PhotoResolver.prototype, "deletePhoto", null);
__decorate([
    type_graphql_1.Authorized("ADMIN"),
    type_graphql_1.Mutation(() => Boolean),
    __param(0, type_graphql_1.Arg("photoId", () => type_graphql_1.Int)),
    __param(1, type_graphql_1.Arg("collectionId", () => type_graphql_1.Int)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], PhotoResolver.prototype, "addPhotoToCollection", null);
__decorate([
    type_graphql_1.Authorized("ADMIN"),
    type_graphql_1.Mutation(() => Boolean),
    __param(0, type_graphql_1.Arg("photoId", () => type_graphql_1.Int)),
    __param(1, type_graphql_1.Arg("collectionId", () => type_graphql_1.Int)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], PhotoResolver.prototype, "removePhotoFromCollection", null);
PhotoResolver = __decorate([
    type_graphql_1.Resolver(() => Photo_1.default),
    __param(0, typeorm_typedi_extensions_1.InjectRepository(Photo_1.default)),
    __param(1, typeorm_typedi_extensions_1.InjectRepository(PhotoCollection_1.default)),
    __metadata("design:paramtypes", [typeorm_1.Repository,
        typeorm_1.Repository])
], PhotoResolver);
exports.default = PhotoResolver;
//# sourceMappingURL=PhotoResolver.js.map