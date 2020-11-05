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
const PhotoTag_1 = __importDefault(require("./PhotoTag"));
let Tag = class Tag extends typeorm_1.BaseEntity {
};
__decorate([
    typeorm_1.Index(),
    type_graphql_1.Field(() => type_graphql_1.ID),
    typeorm_1.PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], Tag.prototype, "id", void 0);
__decorate([
    typeorm_1.Index({ unique: true }),
    type_graphql_1.Field(),
    typeorm_1.Column({ unique: true }),
    __metadata("design:type", String)
], Tag.prototype, "name", void 0);
__decorate([
    type_graphql_1.Field(() => [PhotoTag_1.default]),
    typeorm_1.OneToMany(() => PhotoTag_1.default, (pt) => pt.tag),
    __metadata("design:type", Promise)
], Tag.prototype, "photosWithTag", void 0);
__decorate([
    type_graphql_1.Field(),
    typeorm_1.CreateDateColumn(),
    __metadata("design:type", Date)
], Tag.prototype, "createdAt", void 0);
__decorate([
    type_graphql_1.Field(),
    typeorm_1.UpdateDateColumn(),
    __metadata("design:type", Date)
], Tag.prototype, "updatedAt", void 0);
Tag = __decorate([
    type_graphql_1.ObjectType(),
    typeorm_1.Entity({ name: "tags" })
], Tag);
exports.default = Tag;
//# sourceMappingURL=Tag.js.map