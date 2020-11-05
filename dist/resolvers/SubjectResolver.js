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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const type_graphql_1 = require("type-graphql");
const typeorm_1 = require("typeorm");
const typeorm_typedi_extensions_1 = require("typeorm-typedi-extensions");
const Subject_1 = __importDefault(require("../entities/Subject"));
let SubjectInput = class SubjectInput {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], SubjectInput.prototype, "name", void 0);
SubjectInput = __decorate([
    type_graphql_1.InputType()
], SubjectInput);
let SubjectUpdateInput = class SubjectUpdateInput {
};
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", String)
], SubjectUpdateInput.prototype, "name", void 0);
SubjectUpdateInput = __decorate([
    type_graphql_1.InputType()
], SubjectUpdateInput);
let SubjectResolver = class SubjectResolver {
    constructor(subjectRepository) {
        this.subjectRepository = subjectRepository;
    }
    subjects() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.subjectRepository.find({
                relations: ["photosOfSubject", "photosOfSubject.photo"],
            });
        });
    }
    photosOfSubject(input) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield Subject_1.default.findOne({
                where: { name: input.name },
                relations: [
                    "photosOfSubject",
                    "photosOfSubject.photo",
                    "photosOfSubject.photo.images",
                    "photosOfSubject.photo.tagsForPhoto",
                    "photosOfSubject.photo.tagsForPhoto.tag",
                    "photosOfSubject.photo.photographer",
                    "photosOfSubject.photo.location",
                ],
            });
        });
    }
    addSubject(input) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.subjectRepository.create({ name: input.name }).save();
        });
    }
    updateSubject(id, input) {
        return __awaiter(this, void 0, void 0, function* () {
            const subject = yield this.subjectRepository.findOne(id);
            if (!subject) {
                throw new Error(`No subject with an id of ${id} exists.`);
            }
            yield this.subjectRepository.update(id, Object.assign({}, input));
            const updatedSubject = this.subjectRepository.findOne(id);
            return updatedSubject;
        });
    }
    deleteSubject(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const deleteResult = yield this.subjectRepository.delete(id);
            if (deleteResult && deleteResult.affected != 0) {
                return true;
            }
            return false;
        });
    }
};
__decorate([
    type_graphql_1.Query(() => [Subject_1.default]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SubjectResolver.prototype, "subjects", null);
__decorate([
    type_graphql_1.Query(() => Subject_1.default),
    __param(0, type_graphql_1.Arg("input", () => SubjectInput)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [SubjectInput]),
    __metadata("design:returntype", Promise)
], SubjectResolver.prototype, "photosOfSubject", null);
__decorate([
    type_graphql_1.Authorized("ADMIN"),
    type_graphql_1.Mutation(() => Subject_1.default),
    __param(0, type_graphql_1.Arg("input", () => SubjectInput)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [SubjectInput]),
    __metadata("design:returntype", Promise)
], SubjectResolver.prototype, "addSubject", null);
__decorate([
    type_graphql_1.Authorized("ADMIN"),
    type_graphql_1.Mutation(() => Subject_1.default),
    __param(0, type_graphql_1.Arg("id", () => type_graphql_1.Int)),
    __param(1, type_graphql_1.Arg("input", () => SubjectUpdateInput)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, SubjectUpdateInput]),
    __metadata("design:returntype", Promise)
], SubjectResolver.prototype, "updateSubject", null);
__decorate([
    type_graphql_1.Authorized("ADMIN"),
    type_graphql_1.Mutation(() => Boolean),
    __param(0, type_graphql_1.Arg("id", () => type_graphql_1.Int)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], SubjectResolver.prototype, "deleteSubject", null);
SubjectResolver = __decorate([
    type_graphql_1.Resolver(() => Subject_1.default),
    __param(0, typeorm_typedi_extensions_1.InjectRepository(Subject_1.default)),
    __metadata("design:paramtypes", [typeorm_1.Repository])
], SubjectResolver);
exports.default = SubjectResolver;
//# sourceMappingURL=SubjectResolver.js.map