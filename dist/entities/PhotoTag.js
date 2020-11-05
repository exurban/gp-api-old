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
const type_graphql_1 = require("type-graphql");
const typeorm_1 = require("typeorm");
const Photo_1 = __importDefault(require("./Photo"));
const Tag_1 = __importDefault(require("./Tag"));
let PhotoTag = class PhotoTag extends typeorm_1.BaseEntity {
};
__decorate([
    type_graphql_1.Field(() => Tag_1.default),
    typeorm_1.PrimaryColumn(),
    __metadata("design:type", Number)
], PhotoTag.prototype, "tagId", void 0);
__decorate([
    typeorm_1.Index(),
    type_graphql_1.Field(() => Tag_1.default),
    typeorm_1.ManyToOne(() => Tag_1.default, (tag) => tag.photosWithTag),
    typeorm_1.JoinColumn({ name: "tag_id" }),
    __metadata("design:type", Tag_1.default)
], PhotoTag.prototype, "tag", void 0);
__decorate([
    type_graphql_1.Field(() => Photo_1.default),
    typeorm_1.PrimaryColumn(),
    __metadata("design:type", Number)
], PhotoTag.prototype, "photoId", void 0);
__decorate([
    typeorm_1.Index(),
    type_graphql_1.Field(() => Photo_1.default),
    typeorm_1.ManyToOne(() => Photo_1.default, (photo) => photo.tagsForPhoto),
    typeorm_1.JoinColumn({ name: "photo_id" }),
    __metadata("design:type", Photo_1.default)
], PhotoTag.prototype, "photo", void 0);
PhotoTag = __decorate([
    type_graphql_1.ObjectType(),
    typeorm_1.Entity({ name: "photo_tags" })
], PhotoTag);
exports.default = PhotoTag;
//# sourceMappingURL=PhotoTag.js.map