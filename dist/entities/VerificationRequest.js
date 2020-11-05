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
exports.VerificationRequest = void 0;
const typeorm_1 = require("typeorm");
let VerificationRequest = class VerificationRequest extends typeorm_1.BaseEntity {
};
__decorate([
    typeorm_1.PrimaryGeneratedColumn("increment"),
    __metadata("design:type", Number)
], VerificationRequest.prototype, "id", void 0);
__decorate([
    typeorm_1.Column({ type: "varchar" }),
    __metadata("design:type", String)
], VerificationRequest.prototype, "identifier", void 0);
__decorate([
    typeorm_1.Index({ unique: true }),
    typeorm_1.Column({ type: "varchar" }),
    __metadata("design:type", String)
], VerificationRequest.prototype, "token", void 0);
__decorate([
    typeorm_1.Column({ type: "timestamptz" }),
    __metadata("design:type", Date)
], VerificationRequest.prototype, "expires", void 0);
__decorate([
    typeorm_1.CreateDateColumn({ type: "timestamptz" }),
    __metadata("design:type", Date)
], VerificationRequest.prototype, "createdAt", void 0);
__decorate([
    typeorm_1.UpdateDateColumn({ type: "timestamptz" }),
    __metadata("design:type", Date)
], VerificationRequest.prototype, "updatedAt", void 0);
VerificationRequest = __decorate([
    typeorm_1.Entity({ name: "verification_requests" })
], VerificationRequest);
exports.VerificationRequest = VerificationRequest;
//# sourceMappingURL=VerificationRequest.js.map