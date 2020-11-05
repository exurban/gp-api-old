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
const Finish_1 = __importDefault(require("../entities/Finish"));
let FinishInput = class FinishInput {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], FinishInput.prototype, "name", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], FinishInput.prototype, "description", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], FinishInput.prototype, "photoUrl", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], FinishInput.prototype, "finSku", void 0);
__decorate([
    type_graphql_1.Field(() => type_graphql_1.Float),
    __metadata("design:type", Number)
], FinishInput.prototype, "width", void 0);
__decorate([
    type_graphql_1.Field(() => type_graphql_1.Float),
    __metadata("design:type", Number)
], FinishInput.prototype, "height", void 0);
__decorate([
    type_graphql_1.Field(() => type_graphql_1.Float),
    __metadata("design:type", Number)
], FinishInput.prototype, "depth", void 0);
__decorate([
    type_graphql_1.Field(() => type_graphql_1.Float),
    __metadata("design:type", Number)
], FinishInput.prototype, "weight", void 0);
__decorate([
    type_graphql_1.Field(() => type_graphql_1.Float),
    __metadata("design:type", Number)
], FinishInput.prototype, "shippingWeight", void 0);
__decorate([
    type_graphql_1.Field(() => type_graphql_1.Float),
    __metadata("design:type", Number)
], FinishInput.prototype, "basePrice", void 0);
__decorate([
    type_graphql_1.Field(() => type_graphql_1.Float),
    __metadata("design:type", Number)
], FinishInput.prototype, "priceModifier", void 0);
FinishInput = __decorate([
    type_graphql_1.InputType()
], FinishInput);
let FinishUpdateInput = class FinishUpdateInput {
};
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", String)
], FinishUpdateInput.prototype, "name", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", String)
], FinishUpdateInput.prototype, "description", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", String)
], FinishUpdateInput.prototype, "photoUrl", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", String)
], FinishUpdateInput.prototype, "finSku", void 0);
__decorate([
    type_graphql_1.Field(() => type_graphql_1.Float, { nullable: true }),
    __metadata("design:type", Number)
], FinishUpdateInput.prototype, "width", void 0);
__decorate([
    type_graphql_1.Field(() => type_graphql_1.Float, { nullable: true }),
    __metadata("design:type", Number)
], FinishUpdateInput.prototype, "height", void 0);
__decorate([
    type_graphql_1.Field(() => type_graphql_1.Float, { nullable: true }),
    __metadata("design:type", Number)
], FinishUpdateInput.prototype, "depth", void 0);
__decorate([
    type_graphql_1.Field(() => type_graphql_1.Float, { nullable: true }),
    __metadata("design:type", Number)
], FinishUpdateInput.prototype, "weight", void 0);
__decorate([
    type_graphql_1.Field(() => type_graphql_1.Float, { nullable: true }),
    __metadata("design:type", Number)
], FinishUpdateInput.prototype, "shippingWeight", void 0);
__decorate([
    type_graphql_1.Field(() => type_graphql_1.Float, { nullable: true }),
    __metadata("design:type", Number)
], FinishUpdateInput.prototype, "basePrice", void 0);
__decorate([
    type_graphql_1.Field(() => type_graphql_1.Float, { nullable: true }),
    __metadata("design:type", Number)
], FinishUpdateInput.prototype, "priceModifier", void 0);
FinishUpdateInput = __decorate([
    type_graphql_1.InputType()
], FinishUpdateInput);
let FinishResolver = class FinishResolver {
    constructor(finishRepository) {
        this.finishRepository = finishRepository;
    }
    finishes() {
        return this.finishRepository.find();
    }
    finish(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.finishRepository.findOne(id);
        });
    }
    finishSku(finish) {
        return `${finish.finSku}-${finish.height}x${finish.width}`;
    }
    addFinish(input) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.finishRepository.create(input).save();
        });
    }
    updateFinish(id, input) {
        return __awaiter(this, void 0, void 0, function* () {
            const finish = yield this.finishRepository.findOne({ id });
            if (!finish) {
                throw new Error(`No finish with an id of ${id} exists.`);
            }
            yield this.finishRepository.update(id, Object.assign({}, input));
            const updatedFinish = yield this.finishRepository.findOne(id);
            return updatedFinish;
        });
    }
    deleteFinish(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const deleteResult = yield this.finishRepository.delete({ id });
            if (deleteResult && deleteResult.affected != 0) {
                return true;
            }
            return false;
        });
    }
};
__decorate([
    type_graphql_1.Query(() => [Finish_1.default]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], FinishResolver.prototype, "finishes", null);
__decorate([
    type_graphql_1.Query(() => Finish_1.default, { nullable: true }),
    __param(0, type_graphql_1.Arg("id", () => type_graphql_1.Int)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], FinishResolver.prototype, "finish", null);
__decorate([
    type_graphql_1.FieldResolver(() => String),
    __param(0, type_graphql_1.Root()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Finish_1.default]),
    __metadata("design:returntype", void 0)
], FinishResolver.prototype, "finishSku", null);
__decorate([
    type_graphql_1.Authorized("ADMIN"),
    type_graphql_1.Mutation(() => Finish_1.default),
    __param(0, type_graphql_1.Arg("input", () => FinishInput)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [FinishInput]),
    __metadata("design:returntype", Promise)
], FinishResolver.prototype, "addFinish", null);
__decorate([
    type_graphql_1.Authorized("ADMIN"),
    type_graphql_1.Mutation(() => Finish_1.default, { nullable: true }),
    __param(0, type_graphql_1.Arg("id", () => type_graphql_1.Int)),
    __param(1, type_graphql_1.Arg("input", () => FinishUpdateInput)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, FinishUpdateInput]),
    __metadata("design:returntype", Promise)
], FinishResolver.prototype, "updateFinish", null);
__decorate([
    type_graphql_1.Authorized("ADMIN"),
    type_graphql_1.Mutation(() => Boolean),
    __param(0, type_graphql_1.Arg("id", () => type_graphql_1.Int)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], FinishResolver.prototype, "deleteFinish", null);
FinishResolver = __decorate([
    type_graphql_1.Resolver(() => Finish_1.default),
    __param(0, typeorm_typedi_extensions_1.InjectRepository(Finish_1.default)),
    __metadata("design:paramtypes", [typeorm_1.Repository])
], FinishResolver);
exports.default = FinishResolver;
//# sourceMappingURL=FinishResolver.js.map