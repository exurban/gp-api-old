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
const Tag_1 = __importDefault(require("../entities/Tag"));
let TagInput = class TagInput {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], TagInput.prototype, "name", void 0);
TagInput = __decorate([
    type_graphql_1.InputType()
], TagInput);
let TagUpdateInput = class TagUpdateInput {
};
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", String)
], TagUpdateInput.prototype, "name", void 0);
TagUpdateInput = __decorate([
    type_graphql_1.InputType()
], TagUpdateInput);
let SubjectResolver = class SubjectResolver {
    constructor(tagRepository) {
        this.tagRepository = tagRepository;
    }
    tags() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.tagRepository.find({
                relations: ["photosWithTag", "photosWithTag.photo"],
            });
        });
    }
    photosWithTag(input) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield Tag_1.default.findOne({
                where: { name: input.name },
                relations: ["photosWithTag", "photosWithTag.photo"],
            });
        });
    }
    addTag(input) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.tagRepository.create({ name: input.name }).save();
        });
    }
    updateTag(id, input) {
        return __awaiter(this, void 0, void 0, function* () {
            const tag = yield this.tagRepository.findOne(id);
            if (!tag) {
                throw new Error(`No tag with an id of ${id} exists.`);
            }
            yield this.tagRepository.update(id, Object.assign({}, input));
            const updatedTag = this.tagRepository.findOne(id);
            return updatedTag;
        });
    }
    deleteTag(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const deleteResult = yield this.tagRepository.delete(id);
            if (deleteResult && deleteResult.affected != 0) {
                return true;
            }
            return false;
        });
    }
};
__decorate([
    type_graphql_1.Query(() => [Tag_1.default]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SubjectResolver.prototype, "tags", null);
__decorate([
    type_graphql_1.Query(() => Tag_1.default),
    __param(0, type_graphql_1.Arg("input", () => TagInput)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [TagInput]),
    __metadata("design:returntype", Promise)
], SubjectResolver.prototype, "photosWithTag", null);
__decorate([
    type_graphql_1.Authorized("ADMIN"),
    type_graphql_1.Mutation(() => Tag_1.default),
    __param(0, type_graphql_1.Arg("input", () => TagInput)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [TagInput]),
    __metadata("design:returntype", Promise)
], SubjectResolver.prototype, "addTag", null);
__decorate([
    type_graphql_1.Authorized("ADMIN"),
    type_graphql_1.Mutation(() => Tag_1.default),
    __param(0, type_graphql_1.Arg("id", () => type_graphql_1.Int)),
    __param(1, type_graphql_1.Arg("input", () => TagUpdateInput)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, TagUpdateInput]),
    __metadata("design:returntype", Promise)
], SubjectResolver.prototype, "updateTag", null);
__decorate([
    type_graphql_1.Authorized("ADMIN"),
    type_graphql_1.Mutation(() => Boolean),
    __param(0, type_graphql_1.Arg("id", () => type_graphql_1.Int)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], SubjectResolver.prototype, "deleteTag", null);
SubjectResolver = __decorate([
    type_graphql_1.Resolver(() => Tag_1.default),
    __param(0, typeorm_typedi_extensions_1.InjectRepository(Tag_1.default)),
    __metadata("design:paramtypes", [typeorm_1.Repository])
], SubjectResolver);
exports.default = SubjectResolver;
//# sourceMappingURL=TagResolver.js.map