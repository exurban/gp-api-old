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
let Photographer = class Photographer extends typeorm_1.BaseEntity {
};
__decorate([
    type_graphql_1.Field(() => type_graphql_1.ID),
    typeorm_1.PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], Photographer.prototype, "id", void 0);
__decorate([
    type_graphql_1.Field({
        description: "Derived field that returns `${firstName} ${lastName}`",
    }),
    __metadata("design:type", String)
], Photographer.prototype, "name", void 0);
__decorate([
    type_graphql_1.Field({
        description: "The artist's first name.",
    }),
    typeorm_1.Column(),
    __metadata("design:type", String)
], Photographer.prototype, "firstName", void 0);
__decorate([
    type_graphql_1.Field({
        description: "The artist's last name.",
    }),
    typeorm_1.Column(),
    __metadata("design:type", String)
], Photographer.prototype, "lastName", void 0);
__decorate([
    type_graphql_1.Field({
        description: "The artist's email address.",
    }),
    typeorm_1.Column(),
    __metadata("design:type", String)
], Photographer.prototype, "email", void 0);
__decorate([
    type_graphql_1.Field({
        description: "The URL for the artist's portrait.",
    }),
    typeorm_1.Column(),
    __metadata("design:type", String)
], Photographer.prototype, "photoUrl", void 0);
__decorate([
    type_graphql_1.Field({
        description: "The artist's biography.",
    }),
    typeorm_1.Column("text"),
    __metadata("design:type", String)
], Photographer.prototype, "bio", void 0);
__decorate([
    type_graphql_1.Field(() => [Photo_1.default], {
        description: "Photos attributed to the artist.",
    }),
    typeorm_1.OneToMany(() => Photo_1.default, (photo) => photo.photographer),
    __metadata("design:type", Array)
], Photographer.prototype, "photos", void 0);
__decorate([
    type_graphql_1.Field({
        description: "Date record was created.",
    }),
    typeorm_1.CreateDateColumn({ type: "timestamptz" }),
    __metadata("design:type", Date)
], Photographer.prototype, "createdAt", void 0);
__decorate([
    type_graphql_1.Field({
        description: "Date record was most recently updated.",
    }),
    typeorm_1.UpdateDateColumn({ type: "timestamptz" }),
    __metadata("design:type", Date)
], Photographer.prototype, "updatedAt", void 0);
Photographer = __decorate([
    type_graphql_1.ObjectType(),
    typeorm_1.Entity({ name: "photographers" })
], Photographer);
exports.default = Photographer;
//# sourceMappingURL=Photographer.js.map