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
const UserFavorite_1 = __importDefault(require("./UserFavorite"));
const UserShoppingBagItem_1 = __importDefault(require("./UserShoppingBagItem"));
let User = class User extends typeorm_1.BaseEntity {
};
__decorate([
    type_graphql_1.Field(() => type_graphql_1.ID),
    typeorm_1.PrimaryGeneratedColumn("increment"),
    __metadata("design:type", Number)
], User.prototype, "id", void 0);
__decorate([
    type_graphql_1.Field(),
    typeorm_1.Column({ type: "varchar", nullable: true }),
    __metadata("design:type", String)
], User.prototype, "name", void 0);
__decorate([
    type_graphql_1.Field(),
    typeorm_1.Index({ unique: true }),
    typeorm_1.Column({ type: "varchar", nullable: true }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    typeorm_1.Column({ type: "timestamptz", nullable: true }),
    __metadata("design:type", Date)
], User.prototype, "email_verified", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    typeorm_1.Column({ type: "varchar", nullable: true }),
    __metadata("design:type", String)
], User.prototype, "image", void 0);
__decorate([
    type_graphql_1.Field(() => [String]),
    typeorm_1.Column("simple-array", { default: "USER" }),
    __metadata("design:type", Array)
], User.prototype, "roles", void 0);
__decorate([
    type_graphql_1.Field(() => Boolean),
    typeorm_1.Column({ type: "boolean", default: false }),
    __metadata("design:type", Boolean)
], User.prototype, "isSubscribed", void 0);
__decorate([
    type_graphql_1.Field(() => [UserFavorite_1.default]),
    typeorm_1.OneToMany(() => UserFavorite_1.default, (fav) => fav.user),
    __metadata("design:type", Promise)
], User.prototype, "userFavorites", void 0);
__decorate([
    type_graphql_1.Field(() => [UserShoppingBagItem_1.default]),
    typeorm_1.OneToMany(() => UserShoppingBagItem_1.default, (sb) => sb.user),
    __metadata("design:type", Promise)
], User.prototype, "userShoppingBagItems", void 0);
__decorate([
    type_graphql_1.Field(),
    typeorm_1.CreateDateColumn({ type: "timestamptz" }),
    __metadata("design:type", Date)
], User.prototype, "createdAt", void 0);
__decorate([
    type_graphql_1.Field(),
    typeorm_1.UpdateDateColumn({ type: "timestamptz" }),
    __metadata("design:type", Date)
], User.prototype, "updatedAt", void 0);
User = __decorate([
    type_graphql_1.ObjectType(),
    typeorm_1.Entity({ name: "users" })
], User);
exports.default = User;
//# sourceMappingURL=User.js.map