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
const Photographer_1 = __importDefault(require("../entities/Photographer"));
let PhotographerInput = class PhotographerInput {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], PhotographerInput.prototype, "firstName", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], PhotographerInput.prototype, "lastName", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], PhotographerInput.prototype, "email", void 0);
__decorate([
    type_graphql_1.Field(() => String),
    __metadata("design:type", String)
], PhotographerInput.prototype, "bio", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], PhotographerInput.prototype, "photoUrl", void 0);
PhotographerInput = __decorate([
    type_graphql_1.InputType()
], PhotographerInput);
let PhotographerUpdateInput = class PhotographerUpdateInput {
};
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", String)
], PhotographerUpdateInput.prototype, "firstName", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", String)
], PhotographerUpdateInput.prototype, "lastName", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", String)
], PhotographerUpdateInput.prototype, "email", void 0);
__decorate([
    type_graphql_1.Field(() => String, { nullable: true }),
    __metadata("design:type", String)
], PhotographerUpdateInput.prototype, "bio", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", String)
], PhotographerUpdateInput.prototype, "photoUrl", void 0);
PhotographerUpdateInput = __decorate([
    type_graphql_1.InputType()
], PhotographerUpdateInput);
let PhotographerResolver = class PhotographerResolver {
    constructor(photographerRepository) {
        this.photographerRepository = photographerRepository;
    }
    photographers() {
        return this.photographerRepository.find({
            relations: ["photos", "photos.location", "photos.collectionsForPhoto"],
        });
    }
    photographer(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.photographerRepository.findOne(id, {
                relations: ["photos", "photos.location", "photos.collectionsForPhoto"],
            });
        });
    }
    name(photographer) {
        return `${photographer.firstName} ${photographer.lastName}`;
    }
    addPhotographer(input) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.photographerRepository.create(input).save();
        });
    }
    updatePhotographer(id, input) {
        return __awaiter(this, void 0, void 0, function* () {
            const photographer = yield this.photographerRepository.findOne({ id });
            if (!photographer) {
                throw new Error(`No photographer with an id of ${id} exists.`);
            }
            yield this.photographerRepository.update(id, Object.assign({}, input));
            const updatedPhotographer = yield this.photographerRepository.findOne(id);
            return updatedPhotographer;
        });
    }
    deletePhotographer(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const deleteResult = yield this.photographerRepository.delete({ id });
            if (deleteResult && deleteResult.affected != 0) {
                return true;
            }
            return false;
        });
    }
};
__decorate([
    type_graphql_1.Query(() => [Photographer_1.default]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PhotographerResolver.prototype, "photographers", null);
__decorate([
    type_graphql_1.Query(() => Photographer_1.default, { nullable: true }),
    __param(0, type_graphql_1.Arg("id", () => type_graphql_1.Int)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], PhotographerResolver.prototype, "photographer", null);
__decorate([
    type_graphql_1.FieldResolver(),
    __param(0, type_graphql_1.Root()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Photographer_1.default]),
    __metadata("design:returntype", void 0)
], PhotographerResolver.prototype, "name", null);
__decorate([
    type_graphql_1.Authorized("ADMIN"),
    type_graphql_1.Mutation(() => Photographer_1.default),
    __param(0, type_graphql_1.Arg("input", () => PhotographerInput)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [PhotographerInput]),
    __metadata("design:returntype", Promise)
], PhotographerResolver.prototype, "addPhotographer", null);
__decorate([
    type_graphql_1.Authorized("ADMIN"),
    type_graphql_1.Mutation(() => Photographer_1.default, { nullable: true }),
    __param(0, type_graphql_1.Arg("id", () => type_graphql_1.Int)),
    __param(1, type_graphql_1.Arg("input", () => PhotographerUpdateInput)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, PhotographerUpdateInput]),
    __metadata("design:returntype", Promise)
], PhotographerResolver.prototype, "updatePhotographer", null);
__decorate([
    type_graphql_1.Authorized("ADMIN"),
    type_graphql_1.Mutation(() => Boolean),
    __param(0, type_graphql_1.Arg("id", () => type_graphql_1.Int)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], PhotographerResolver.prototype, "deletePhotographer", null);
PhotographerResolver = __decorate([
    type_graphql_1.Resolver(() => Photographer_1.default),
    __param(0, typeorm_typedi_extensions_1.InjectRepository(Photographer_1.default)),
    __metadata("design:paramtypes", [typeorm_1.Repository])
], PhotographerResolver);
exports.default = PhotographerResolver;
//# sourceMappingURL=PhotographerResolver.js.map