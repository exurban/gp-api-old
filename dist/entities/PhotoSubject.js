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
const Subject_1 = __importDefault(require("./Subject"));
let PhotoSubject = class PhotoSubject extends typeorm_1.BaseEntity {
};
__decorate([
    type_graphql_1.Field(() => Subject_1.default),
    typeorm_1.PrimaryColumn(),
    __metadata("design:type", Number)
], PhotoSubject.prototype, "subjectId", void 0);
__decorate([
    typeorm_1.Index(),
    type_graphql_1.Field(() => Subject_1.default),
    typeorm_1.ManyToOne(() => Subject_1.default, (subject) => subject.photosOfSubject),
    typeorm_1.JoinColumn({ name: "subject_id" }),
    __metadata("design:type", Subject_1.default)
], PhotoSubject.prototype, "subject", void 0);
__decorate([
    type_graphql_1.Field(() => Photo_1.default),
    typeorm_1.PrimaryColumn(),
    __metadata("design:type", Number)
], PhotoSubject.prototype, "photoId", void 0);
__decorate([
    typeorm_1.Index(),
    type_graphql_1.Field(() => Photo_1.default),
    typeorm_1.ManyToOne(() => Photo_1.default, (photo) => photo.subjectsInPhoto),
    typeorm_1.JoinColumn({ name: "photo_id" }),
    __metadata("design:type", Photo_1.default)
], PhotoSubject.prototype, "photo", void 0);
PhotoSubject = __decorate([
    type_graphql_1.ObjectType(),
    typeorm_1.Entity({ name: "photo_subjects" })
], PhotoSubject);
exports.default = PhotoSubject;
//# sourceMappingURL=PhotoSubject.js.map