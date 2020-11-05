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
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
let Account = class Account extends typeorm_1.BaseEntity {
};
__decorate([
    typeorm_1.PrimaryGeneratedColumn("increment"),
    __metadata("design:type", Number)
], Account.prototype, "id", void 0);
__decorate([
    typeorm_1.Index({ unique: true }),
    typeorm_1.Column({ type: "varchar" }),
    __metadata("design:type", String)
], Account.prototype, "compoundId", void 0);
__decorate([
    typeorm_1.Index("userId"),
    typeorm_1.Column(),
    __metadata("design:type", Number)
], Account.prototype, "userId", void 0);
__decorate([
    typeorm_1.Column("varchar"),
    __metadata("design:type", String)
], Account.prototype, "providerType", void 0);
__decorate([
    typeorm_1.Index("providerId"),
    typeorm_1.Column({ type: "varchar" }),
    __metadata("design:type", String)
], Account.prototype, "providerId", void 0);
__decorate([
    typeorm_1.Index("providerAccountId"),
    typeorm_1.Column({ type: "varchar" }),
    __metadata("design:type", String)
], Account.prototype, "providerAccountId", void 0);
__decorate([
    typeorm_1.Column("text", { nullable: true }),
    __metadata("design:type", String)
], Account.prototype, "refreshToken", void 0);
__decorate([
    typeorm_1.Column("text", { nullable: true }),
    __metadata("design:type", String)
], Account.prototype, "accessToken", void 0);
__decorate([
    typeorm_1.Column({ type: "timestamptz", nullable: true }),
    __metadata("design:type", Date)
], Account.prototype, "accessTokenExpires", void 0);
__decorate([
    typeorm_1.CreateDateColumn({ type: "timestamptz" }),
    __metadata("design:type", Date)
], Account.prototype, "createdAt", void 0);
__decorate([
    typeorm_1.UpdateDateColumn({ type: "timestamptz" }),
    __metadata("design:type", Date)
], Account.prototype, "updatedAt", void 0);
Account = __decorate([
    typeorm_1.Entity({ name: "accounts" })
], Account);
exports.default = Account;
//# sourceMappingURL=Account.js.map