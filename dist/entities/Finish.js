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
const PhotoFinish_1 = __importDefault(require("./PhotoFinish"));
let Finish = class Finish extends typeorm_1.BaseEntity {
};
__decorate([
    type_graphql_1.Field(() => type_graphql_1.ID),
    typeorm_1.PrimaryGeneratedColumn("increment"),
    __metadata("design:type", Number)
], Finish.prototype, "id", void 0);
__decorate([
    type_graphql_1.Field(),
    typeorm_1.Column(),
    __metadata("design:type", String)
], Finish.prototype, "name", void 0);
__decorate([
    type_graphql_1.Field(),
    typeorm_1.Column(),
    __metadata("design:type", String)
], Finish.prototype, "description", void 0);
__decorate([
    type_graphql_1.Field(),
    typeorm_1.Column(),
    __metadata("design:type", String)
], Finish.prototype, "photoUrl", void 0);
__decorate([
    type_graphql_1.Field({
        nullable: true,
        description: "finSku: Finish SKU. imgSku + finSku = ProductSku.",
    }),
    typeorm_1.Column({ unique: true, nullable: true }),
    __metadata("design:type", String)
], Finish.prototype, "finSku", void 0);
__decorate([
    type_graphql_1.Field(() => type_graphql_1.Float),
    typeorm_1.Column("float"),
    __metadata("design:type", Number)
], Finish.prototype, "width", void 0);
__decorate([
    type_graphql_1.Field(() => type_graphql_1.Float),
    typeorm_1.Column("float"),
    __metadata("design:type", Number)
], Finish.prototype, "height", void 0);
__decorate([
    type_graphql_1.Field(() => type_graphql_1.Float),
    typeorm_1.Column("float"),
    __metadata("design:type", Number)
], Finish.prototype, "depth", void 0);
__decorate([
    type_graphql_1.Field(() => type_graphql_1.Float),
    typeorm_1.Column("float"),
    __metadata("design:type", Number)
], Finish.prototype, "weight", void 0);
__decorate([
    type_graphql_1.Field(() => type_graphql_1.Float),
    typeorm_1.Column("float"),
    __metadata("design:type", Number)
], Finish.prototype, "shippingWeight", void 0);
__decorate([
    type_graphql_1.Field(() => type_graphql_1.Float),
    typeorm_1.Column("float"),
    __metadata("design:type", Number)
], Finish.prototype, "basePrice", void 0);
__decorate([
    type_graphql_1.Field(() => type_graphql_1.Float),
    typeorm_1.Column("float"),
    __metadata("design:type", Number)
], Finish.prototype, "priceModifier", void 0);
__decorate([
    type_graphql_1.Field(() => [PhotoFinish_1.default]),
    typeorm_1.OneToMany(() => PhotoFinish_1.default, (pf) => pf.finish),
    __metadata("design:type", Promise)
], Finish.prototype, "photosWithFinish", void 0);
__decorate([
    type_graphql_1.Field(),
    typeorm_1.CreateDateColumn({ type: "timestamptz" }),
    __metadata("design:type", Date)
], Finish.prototype, "createdAt", void 0);
__decorate([
    type_graphql_1.Field(),
    typeorm_1.UpdateDateColumn({ type: "timestamptz" }),
    __metadata("design:type", Date)
], Finish.prototype, "updatedAt", void 0);
Finish = __decorate([
    type_graphql_1.ObjectType(),
    typeorm_1.Entity({ name: "finishes" })
], Finish);
exports.default = Finish;
//# sourceMappingURL=Finish.js.map