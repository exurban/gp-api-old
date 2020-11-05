"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const lodash_1 = __importDefault(require("lodash"));
const faker_1 = __importDefault(require("faker"));
const typeorm_1 = require("typeorm");
const Location_1 = __importDefault(require("../entities/Location"));
const Photographer_1 = __importDefault(require("../entities/Photographer"));
const Photo_1 = __importDefault(require("../entities/Photo"));
const Subject_1 = __importDefault(require("../entities/Subject"));
const PhotoSubject_1 = __importDefault(require("../entities/PhotoSubject"));
const Tag_1 = __importDefault(require("../entities/Tag"));
const PhotoTag_1 = __importDefault(require("../entities/PhotoTag"));
const Collection_1 = __importDefault(require("../entities/Collection"));
const PhotoCollection_1 = __importDefault(require("../entities/PhotoCollection"));
const Finish_1 = __importDefault(require("../entities/Finish"));
const PhotoFinish_1 = __importDefault(require("../entities/PhotoFinish"));
const Image_1 = __importDefault(require("../entities/Image"));
const seedData_1 = require("./seedData");
const newSubjects = [];
const newTags = [];
const newCollections = [];
const newLocations = [];
const newFinishes = [];
const newPhotographers = [];
const addSubjects = () => {
    seedData_1.subjects.forEach((s) => {
        const subj = new Subject_1.default();
        subj.name = s;
        newSubjects.push(subj);
    });
    return newSubjects;
};
const addTags = () => {
    seedData_1.tags.forEach((t) => {
        const tg = new Tag_1.default();
        tg.name = t;
        newTags.push(tg);
    });
    return newTags;
};
const addCollections = (collections) => {
    collections.forEach((c) => {
        const coll = new Collection_1.default();
        coll.name = c.name;
        coll.tag = c.tag;
        coll.description = c.description;
        newCollections.push(coll);
    });
    return newCollections;
};
const addFinishes = (finishes) => {
    finishes.forEach((f) => {
        const fin = new Finish_1.default();
        fin.name = f.name;
        fin.description = f.description;
        fin.photoUrl = f.photoUrl;
        fin.width = f.width;
        fin.height = f.height;
        fin.depth = f.depth;
        fin.weight = f.weight;
        fin.shippingWeight = f.shippingWeight;
        fin.basePrice = f.basePrice;
        fin.priceModifier = f.priceModifier;
        newFinishes.push(fin);
    });
    return newFinishes;
};
const addLocations = (locations) => {
    locations.forEach((l) => {
        const loc = new Location_1.default();
        loc.name = l.name;
        loc.tag = l.tag;
        newLocations.push(loc);
    });
    return newLocations;
};
const addPhotographers = (photographers) => {
    photographers.forEach((pg) => {
        const photog = Photographer_1.default.create(Object.assign({}, pg));
        newPhotographers.push(photog);
    });
    return newPhotographers;
};
const addPhotos = (args) => {
    const newPhotos = [];
    for (let i = 0; i < args.photosCount; i++) {
        const newPhoto = new Photo_1.default();
        newPhoto.title = faker_1.default.lorem.words(5);
        newPhoto.description = faker_1.default.lorem.words(22);
        newPhoto.isFeatured = faker_1.default.random.boolean();
        newPhoto.isLimitedEdition = faker_1.default.random.boolean();
        newPhoto.rating = faker_1.default.random.number({ min: 4, max: 10 });
        newPhoto.basePrice = 375;
        newPhoto.priceModifier = 1.0;
        newPhoto.location = lodash_1.default.sample(newLocations);
        newPhoto.photographer = lodash_1.default.sample(newPhotographers);
        newPhotos.push(newPhoto);
    }
    return newPhotos;
};
const addSubjectsToPhotos = (args) => __awaiter(void 0, void 0, void 0, function* () {
    const [subjects, photos] = yield Promise.all([
        args.sRepository.find(),
        args.pRepository.find(),
    ]);
    Promise.all(photos.map((photo) => __awaiter(void 0, void 0, void 0, function* () {
        var e_1, _a;
        const subjectsForPhoto = lodash_1.default.sampleSize(subjects, 2);
        const newPhotoSubjects = [];
        try {
            for (var subjectsForPhoto_1 = __asyncValues(subjectsForPhoto), subjectsForPhoto_1_1; subjectsForPhoto_1_1 = yield subjectsForPhoto_1.next(), !subjectsForPhoto_1_1.done;) {
                const subject = subjectsForPhoto_1_1.value;
                const ps = yield args.psRepository.create({
                    photo: photo,
                    subject: subject,
                });
                newPhotoSubjects.push(ps);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (subjectsForPhoto_1_1 && !subjectsForPhoto_1_1.done && (_a = subjectsForPhoto_1.return)) yield _a.call(subjectsForPhoto_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        yield args.psRepository.insert(newPhotoSubjects).catch((e) => {
            console.error(e.message);
            process.exit(1);
        });
    })));
});
const addTagsToPhotos = (args) => __awaiter(void 0, void 0, void 0, function* () {
    const [tags, photos] = yield Promise.all([
        args.tRepository.find(),
        args.pRepository.find(),
    ]);
    Promise.all(photos.map((photo) => __awaiter(void 0, void 0, void 0, function* () {
        var e_2, _b;
        const tagsForPhoto = lodash_1.default.sampleSize(tags, 3);
        const newPhotoTags = [];
        try {
            for (var tagsForPhoto_1 = __asyncValues(tagsForPhoto), tagsForPhoto_1_1; tagsForPhoto_1_1 = yield tagsForPhoto_1.next(), !tagsForPhoto_1_1.done;) {
                const tag = tagsForPhoto_1_1.value;
                const pt = yield args.ptRepository.create({
                    photo: photo,
                    tag: tag,
                });
                newPhotoTags.push(pt);
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (tagsForPhoto_1_1 && !tagsForPhoto_1_1.done && (_b = tagsForPhoto_1.return)) yield _b.call(tagsForPhoto_1);
            }
            finally { if (e_2) throw e_2.error; }
        }
        const result = yield args.ptRepository.insert(newPhotoTags).catch((e) => {
            console.error(e.message);
            process.exit(1);
        });
        if (result) {
            return true;
        }
        else {
            return false;
        }
    })));
    return false;
});
const addPhotosToCollections = (args) => __awaiter(void 0, void 0, void 0, function* () {
    const [collections, photos] = yield Promise.all([
        args.cRepository.find(),
        args.pRepository.find(),
    ]);
    Promise.all(collections.map((collection) => __awaiter(void 0, void 0, void 0, function* () {
        var e_3, _c;
        const photosForCollection = lodash_1.default.sampleSize(photos, 9);
        const newPhotoCollections = [];
        try {
            for (var photosForCollection_1 = __asyncValues(photosForCollection), photosForCollection_1_1; photosForCollection_1_1 = yield photosForCollection_1.next(), !photosForCollection_1_1.done;) {
                const photo = photosForCollection_1_1.value;
                const pc = yield args.pcRepository.create({
                    photo: photo,
                    collection: collection,
                });
                newPhotoCollections.push(pc);
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (photosForCollection_1_1 && !photosForCollection_1_1.done && (_c = photosForCollection_1.return)) yield _c.call(photosForCollection_1);
            }
            finally { if (e_3) throw e_3.error; }
        }
        yield args.pcRepository.insert(newPhotoCollections).catch((e) => {
            console.error(e.message);
            process.exit(1);
        });
    })));
});
const addImagesToPhotos = (args) => __awaiter(void 0, void 0, void 0, function* () {
    const photos = yield args.pRepository.find();
    Promise.all(photos.map((photo) => __awaiter(void 0, void 0, void 0, function* () {
        const i = lodash_1.default.sample(seedData_1.imageData);
        const newImg = yield args.iRepository.create(Object.assign(Object.assign({}, i), { photo: photo }));
        yield args.iRepository.insert(newImg);
    })));
});
const addFinishesToPhotos = (args) => __awaiter(void 0, void 0, void 0, function* () {
    const [finishes, photos] = yield Promise.all([
        args.fRepository.find(),
        args.pRepository.find(),
    ]);
    Promise.all(photos.map((photo) => __awaiter(void 0, void 0, void 0, function* () {
        var e_4, _d;
        const newPhotoFinishes = [];
        try {
            for (var finishes_1 = __asyncValues(finishes), finishes_1_1; finishes_1_1 = yield finishes_1.next(), !finishes_1_1.done;) {
                const finish = finishes_1_1.value;
                const pf = yield args.pfRepository.create({
                    photo: photo,
                    finish: finish,
                });
                newPhotoFinishes.push(pf);
            }
        }
        catch (e_4_1) { e_4 = { error: e_4_1 }; }
        finally {
            try {
                if (finishes_1_1 && !finishes_1_1.done && (_d = finishes_1.return)) yield _d.call(finishes_1);
            }
            finally { if (e_4) throw e_4.error; }
        }
        yield args.pfRepository.insert(newPhotoFinishes).catch((e) => {
            console.error(e.message);
            process.exit(1);
        });
    })));
});
const seed = () => __awaiter(void 0, void 0, void 0, function* () {
    const connection = yield typeorm_1.createConnection();
    const photoRepository = yield connection.getRepository(Photo_1.default);
    const photographerRepository = yield connection.getRepository(Photographer_1.default);
    const locationRepository = yield connection.getRepository(Location_1.default);
    const subjectRepository = yield connection.getRepository(Subject_1.default);
    const photoSubjectRepository = yield connection.getRepository(PhotoSubject_1.default);
    const tagRepository = yield connection.getRepository(Tag_1.default);
    const photoTagRepository = yield connection.getRepository(PhotoTag_1.default);
    const collectionRepository = yield connection.getRepository(Collection_1.default);
    const photoCollectionRepository = yield connection.getRepository(PhotoCollection_1.default);
    const imageRepository = yield connection.getRepository(Image_1.default);
    const finishRepository = yield connection.getRepository(Finish_1.default);
    const photoFinishRespository = yield connection.getRepository(PhotoFinish_1.default);
    const photosCount = 10;
    const photoArgs = { photosCount };
    const newSubjects = addSubjects();
    yield subjectRepository.insert(newSubjects).catch((e) => {
        console.error(e.message);
        process.exit(1);
    });
    console.log(`Added Subjects. Starting Tags.`);
    const newTags = addTags();
    yield tagRepository.insert(newTags).catch((e) => {
        console.error(e.message);
        process.exit(1);
    });
    console.log(`Added Tags. Starting Locations.`);
    const newCollections = addCollections(seedData_1.collectionData);
    yield collectionRepository.insert(newCollections).catch((e) => {
        console.error(e.message);
        process.exit(1);
    });
    const newFinishes = addFinishes(seedData_1.finishData);
    yield finishRepository.insert(newFinishes).catch((e) => {
        console.error(e.message);
        process.exit(1);
    });
    const newLocations = addLocations(seedData_1.locationData);
    yield locationRepository.insert(newLocations).catch((e) => {
        console.error(e.message);
        process.exit(1);
    });
    console.log(`Starting to add photographers.`);
    const newPhotographers = addPhotographers(seedData_1.photographerData);
    yield photographerRepository.insert(newPhotographers).catch((e) => {
        console.error(e.message);
        process.exit(1);
    });
    console.log(`Finished Photographers. Starting Photos.`);
    const newPhotos = addPhotos(photoArgs);
    yield photoRepository.insert(newPhotos).catch((e) => {
        console.error(e.message);
        process.exit(1);
    });
    Promise.all(newPhotos.map((photo) => __awaiter(void 0, void 0, void 0, function* () {
        yield photoRepository.update(photo.id, {
            sku: photo.skuGenerator + 1000,
        });
    })));
    yield photoRepository.save;
    console.info(`Finished adding photos. Starting to add relationships.`);
    const sArgs = {
        pRepository: photoRepository,
        sRepository: subjectRepository,
        psRepository: photoSubjectRepository,
    };
    yield addSubjectsToPhotos(sArgs);
    const tArgs = {
        pRepository: photoRepository,
        tRepository: tagRepository,
        ptRepository: photoTagRepository,
    };
    yield addTagsToPhotos(tArgs);
    const cArgs = {
        pRepository: photoRepository,
        cRepository: collectionRepository,
        pcRepository: photoCollectionRepository,
    };
    yield addPhotosToCollections(cArgs);
    const fArgs = {
        pRepository: photoRepository,
        fRepository: finishRepository,
        pfRepository: photoFinishRespository,
    };
    yield addFinishesToPhotos(fArgs);
    const iArgs = {
        iRepository: imageRepository,
        pRepository: photoRepository,
    };
    yield addImagesToPhotos(iArgs);
});
seed();
//# sourceMappingURL=seed.js.map