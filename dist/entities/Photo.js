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
const class_validator_1 = require("class-validator");
const type_graphql_1 = require("type-graphql");
const typeorm_1 = require("typeorm");
const Location_1 = __importDefault(require("./Location"));
const PhotoCollection_1 = __importDefault(require("./PhotoCollection"));
const Image_1 = __importDefault(require("./Image"));
const Photographer_1 = __importDefault(require("./Photographer"));
const PhotoSubject_1 = __importDefault(require("./PhotoSubject"));
const PhotoTag_1 = __importDefault(require("./PhotoTag"));
const UserFavorite_1 = __importDefault(require("./UserFavorite"));
const UserShoppingBagItem_1 = __importDefault(require("./UserShoppingBagItem"));
const PhotoFinish_1 = __importDefault(require("./PhotoFinish"));
let Photo = class Photo extends typeorm_1.BaseEntity {
    fakeSku() {
        this.sku = 1;
    }
    setSku() {
        this.sku = this.skuGenerator + 1000;
    }
};
__decorate([
    type_graphql_1.Field(() => type_graphql_1.ID),
    typeorm_1.PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], Photo.prototype, "id", void 0);
__decorate([
    type_graphql_1.Field(() => type_graphql_1.Int),
    typeorm_1.Column({ type: "int" }),
    typeorm_1.Generated(),
    __metadata("design:type", Number)
], Photo.prototype, "skuGenerator", void 0);
__decorate([
    typeorm_1.Index(),
    type_graphql_1.Field(() => type_graphql_1.Int),
    typeorm_1.Column({ type: "int" }),
    __metadata("design:type", Number)
], Photo.prototype, "sku", void 0);
__decorate([
    typeorm_1.Index(),
    type_graphql_1.Field(),
    typeorm_1.Column({ default: "Untitled" }),
    __metadata("design:type", String)
], Photo.prototype, "title", void 0);
__decorate([
    type_graphql_1.Field(),
    typeorm_1.Column({ default: "No description provided." }),
    __metadata("design:type", String)
], Photo.prototype, "description", void 0);
__decorate([
    type_graphql_1.Field(),
    typeorm_1.Column("boolean", { default: false }),
    __metadata("design:type", Boolean)
], Photo.prototype, "discontinued", void 0);
__decorate([
    type_graphql_1.Field(),
    typeorm_1.Column("boolean", { default: false }),
    __metadata("design:type", Boolean)
], Photo.prototype, "isFeatured", void 0);
__decorate([
    type_graphql_1.Field(),
    typeorm_1.Column("boolean", { default: false }),
    __metadata("design:type", Boolean)
], Photo.prototype, "isLimitedEdition", void 0);
__decorate([
    type_graphql_1.Field(() => type_graphql_1.Int),
    typeorm_1.Column("int", { default: 5 }),
    class_validator_1.Min(1),
    class_validator_1.Max(10),
    __metadata("design:type", Number)
], Photo.prototype, "rating", void 0);
__decorate([
    type_graphql_1.Field(() => type_graphql_1.Float, { nullable: true }),
    typeorm_1.Column("float", { nullable: true }),
    __metadata("design:type", Number)
], Photo.prototype, "basePrice", void 0);
__decorate([
    type_graphql_1.Field(() => type_graphql_1.Float, { nullable: true }),
    typeorm_1.Column("float", { nullable: true }),
    __metadata("design:type", Number)
], Photo.prototype, "priceModifier", void 0);
__decorate([
    type_graphql_1.Field(() => Photographer_1.default),
    typeorm_1.ManyToOne(() => Photographer_1.default, (photographer) => photographer.photos),
    typeorm_1.JoinColumn(),
    __metadata("design:type", Photographer_1.default)
], Photo.prototype, "photographer", void 0);
__decorate([
    type_graphql_1.Field(() => Location_1.default),
    typeorm_1.ManyToOne(() => Location_1.default, (location) => location.photos),
    typeorm_1.JoinColumn(),
    __metadata("design:type", Location_1.default)
], Photo.prototype, "location", void 0);
__decorate([
    type_graphql_1.Field(() => [Image_1.default]),
    typeorm_1.OneToMany(() => Image_1.default, (img) => img.photo),
    __metadata("design:type", Array)
], Photo.prototype, "images", void 0);
__decorate([
    type_graphql_1.Field(() => [PhotoSubject_1.default]),
    typeorm_1.OneToMany(() => PhotoSubject_1.default, (ps) => ps.photo),
    __metadata("design:type", Promise)
], Photo.prototype, "subjectsInPhoto", void 0);
__decorate([
    type_graphql_1.Field(() => [PhotoTag_1.default]),
    typeorm_1.OneToMany(() => PhotoTag_1.default, (ps) => ps.photo),
    __metadata("design:type", Promise)
], Photo.prototype, "tagsForPhoto", void 0);
__decorate([
    type_graphql_1.Field(() => [PhotoCollection_1.default]),
    typeorm_1.OneToMany(() => PhotoCollection_1.default, (pc) => pc.photo),
    __metadata("design:type", Promise)
], Photo.prototype, "collectionsForPhoto", void 0);
__decorate([
    type_graphql_1.Field(() => [PhotoFinish_1.default]),
    typeorm_1.OneToMany(() => PhotoFinish_1.default, (pc) => pc.photo),
    __metadata("design:type", Promise)
], Photo.prototype, "finishesForPhoto", void 0);
__decorate([
    type_graphql_1.Field(() => [UserFavorite_1.default]),
    typeorm_1.OneToMany(() => UserFavorite_1.default, (fav) => fav.photo),
    __metadata("design:type", Promise)
], Photo.prototype, "favoritedByUsers", void 0);
__decorate([
    type_graphql_1.Field(() => [UserShoppingBagItem_1.default]),
    typeorm_1.OneToMany(() => UserShoppingBagItem_1.default, (sb) => sb.photo),
    __metadata("design:type", Array)
], Photo.prototype, "inShoppingBagsOfUsers", void 0);
__decorate([
    type_graphql_1.Field(),
    typeorm_1.CreateDateColumn({ type: "timestamptz" }),
    __metadata("design:type", Date)
], Photo.prototype, "createdAt", void 0);
__decorate([
    type_graphql_1.Field(),
    typeorm_1.UpdateDateColumn({ type: "timestamptz" }),
    __metadata("design:type", Date)
], Photo.prototype, "updatedAt", void 0);
__decorate([
    typeorm_1.BeforeInsert(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], Photo.prototype, "fakeSku", null);
__decorate([
    typeorm_1.AfterInsert(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], Photo.prototype, "setSku", null);
Photo = __decorate([
    type_graphql_1.ObjectType(),
    typeorm_1.Entity({ name: "photos" })
], Photo);
exports.default = Photo;
//# sourceMappingURL=Photo.js.map