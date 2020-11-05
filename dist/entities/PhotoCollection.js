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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const Photo_1 = __importDefault(require("./Photo"));
const Collection_1 = __importDefault(require("./Collection"));
const type_graphql_1 = require("type-graphql");
let PhotoCollection = class PhotoCollection extends typeorm_1.BaseEntity {
};
__decorate([
    type_graphql_1.Field(() => Collection_1.default),
    typeorm_1.PrimaryColumn(),
    __metadata("design:type", Number)
], PhotoCollection.prototype, "collectionId", void 0);
__decorate([
    type_graphql_1.Field(() => Collection_1.default),
    typeorm_1.ManyToOne(() => Collection_1.default, (collection) => collection.photosInCollection),
    typeorm_1.JoinColumn({ name: "collection_id" }),
    __metadata("design:type", Collection_1.default)
], PhotoCollection.prototype, "collection", void 0);
__decorate([
    type_graphql_1.Field(() => Photo_1.default),
    typeorm_1.PrimaryColumn(),
    __metadata("design:type", Number)
], PhotoCollection.prototype, "photoId", void 0);
__decorate([
    type_graphql_1.Field(() => Photo_1.default),
    typeorm_1.ManyToOne(() => Photo_1.default, (photo) => photo.collectionsForPhoto),
    typeorm_1.JoinColumn({ name: "photo_id" }),
    __metadata("design:type", Photo_1.default)
], PhotoCollection.prototype, "photo", void 0);
PhotoCollection = __decorate([
    type_graphql_1.ObjectType(),
    typeorm_1.Entity({ name: "photo_collections" })
], PhotoCollection);
exports.default = PhotoCollection;
//# sourceMappingURL=PhotoCollection.js.map