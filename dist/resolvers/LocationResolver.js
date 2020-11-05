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
const Location_1 = __importDefault(require("../entities/Location"));
let LocationInput = class LocationInput {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], LocationInput.prototype, "name", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], LocationInput.prototype, "tag", void 0);
LocationInput = __decorate([
    type_graphql_1.InputType()
], LocationInput);
let LocationUpdateInput = class LocationUpdateInput {
};
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", String)
], LocationUpdateInput.prototype, "name", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", String)
], LocationUpdateInput.prototype, "tag", void 0);
LocationUpdateInput = __decorate([
    type_graphql_1.InputType()
], LocationUpdateInput);
let LocationResolver = class LocationResolver {
    constructor(locationRepository) {
        this.locationRepository = locationRepository;
    }
    locations() {
        return __awaiter(this, void 0, void 0, function* () {
            const locations = yield this.locationRepository
                .createQueryBuilder("l")
                .leftJoinAndSelect("l.photos", "p")
                .leftJoinAndSelect("p.photographer", "pg")
                .leftJoinAndSelect("p.collectionsForPhoto", "pc")
                .leftJoinAndSelect("pc.collection", "c", "pc.collectionId = c.id")
                .getMany();
            console.log(`LOCATIONS: ${JSON.stringify(locations, null, 2)}`);
            return locations;
        });
    }
    location(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.locationRepository.findOne(id, {
                relations: [
                    "photos",
                    "photos.photographer",
                    "photos.collectionsForPhoto",
                ],
            });
        });
    }
    addLocation(input) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.locationRepository.create(input).save();
        });
    }
    updateLocation(id, input) {
        return __awaiter(this, void 0, void 0, function* () {
            const loc = yield this.locationRepository.findOne(id);
            if (!loc) {
                throw new Error(`No location with an id of ${id} exists.`);
            }
            yield this.locationRepository.update(id, Object.assign({}, input));
            const updatedLocation = this.locationRepository.findOne(id);
            return updatedLocation;
        });
    }
    deleteLocation(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const deleteResult = yield this.locationRepository.delete({ id });
            if (deleteResult && deleteResult.affected != 0) {
                return true;
            }
            return false;
        });
    }
};
__decorate([
    type_graphql_1.Query(() => [Location_1.default]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LocationResolver.prototype, "locations", null);
__decorate([
    type_graphql_1.Query(() => Location_1.default, { nullable: true }),
    __param(0, type_graphql_1.Arg("id", () => type_graphql_1.Int)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], LocationResolver.prototype, "location", null);
__decorate([
    type_graphql_1.Authorized("ADMIN"),
    type_graphql_1.Mutation(() => Location_1.default),
    __param(0, type_graphql_1.Arg("input", () => LocationInput)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [LocationInput]),
    __metadata("design:returntype", Promise)
], LocationResolver.prototype, "addLocation", null);
__decorate([
    type_graphql_1.Authorized("ADMIN"),
    type_graphql_1.Mutation(() => Location_1.default, { nullable: true }),
    __param(0, type_graphql_1.Arg("id", () => type_graphql_1.Int)),
    __param(1, type_graphql_1.Arg("input", () => LocationUpdateInput)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, LocationUpdateInput]),
    __metadata("design:returntype", Promise)
], LocationResolver.prototype, "updateLocation", null);
__decorate([
    type_graphql_1.Authorized("ADMIN"),
    type_graphql_1.Mutation(() => Boolean),
    __param(0, type_graphql_1.Arg("id", () => type_graphql_1.Int)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], LocationResolver.prototype, "deleteLocation", null);
LocationResolver = __decorate([
    type_graphql_1.Resolver(() => Location_1.default),
    __param(0, typeorm_typedi_extensions_1.InjectRepository(Location_1.default)),
    __metadata("design:paramtypes", [typeorm_1.Repository])
], LocationResolver);
exports.default = LocationResolver;
//# sourceMappingURL=LocationResolver.js.map