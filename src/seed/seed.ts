// Must be at top
import "reflect-metadata";
import _ from "lodash";
import faker from "faker";
import { ConnectionOptions, createConnection, Repository } from "typeorm";
import { SnakeNamingStrategy } from "typeorm-naming-strategies";
import Location from "../entities/Location";
import Photographer from "../entities/Photographer";
import Photo from "../entities/Photo";
import Subject from "../entities/Subject";
import PhotoSubject from "../entities/PhotoSubject";
import Tag from "../entities/Tag";
import PhotoTag from "../entities/PhotoTag";
import Collection from "../entities/Collection";
import PhotoCollection from "../entities/PhotoCollection";
import Finish from "../entities/Finish";
import PhotoFinish from "../entities/PhotoFinish";
import Image from "../entities/Image";

import {
  locationData,
  photographerData,
  subjects,
  tags,
  collectionData,
  finishData,
  imageData,
} from "./seedData";

//! add finishes collections @ManyToMany relationships

const newSubjects: Subject[] = [];
const newTags: Tag[] = [];
const newCollections: Collection[] = [];
const newLocations: Location[] = [];
const newFinishes: Finish[] = [];
const newPhotographers: Photographer[] = [];

interface ILocation {
  name: string;
  tag: string;
  description?: string;
  coverImage?: Image;
}

interface ICollection {
  name: string;
  tag: string;
  description: string;
}

interface IFinish {
  name: string;
  description: string;
  photoUrl: string;
  width: number;
  height: number;
  depth: number;
  weight: number;
  shippingWeight: number;
  basePrice: number;
  priceModifier: number;
}

interface IPhotographer {
  firstName: string;
  lastName: string;
  email: string;
  bio: string;
}

interface IImage {
  imageUrl: string;
  altText: string;
  fileType: string;
  fileExtension: string;
  size: string;
  width: number;
  height: number;
}

const addSubjects = (): Subject[] => {
  subjects.forEach((s) => {
    const subj = new Subject();
    subj.name = s;

    newSubjects.push(subj);
  });

  return newSubjects;
};

const addTags = (): Tag[] => {
  tags.forEach((t) => {
    const tg = new Tag();
    tg.name = t;
    newTags.push(tg);
  });

  return newTags;
};

const addCollections = (collections: ICollection[]): Collection[] => {
  collections.forEach((c) => {
    const coll = new Collection();
    coll.name = c.name;
    coll.tag = c.tag;
    coll.description = c.description;
    newCollections.push(coll);
  });

  return newCollections;
};

const addFinishes = (finishes: IFinish[]): Finish[] => {
  finishes.forEach((f) => {
    const fin = new Finish();
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

const addLocations = (locations: ILocation[]): Location[] => {
  locations.forEach((l) => {
    const loc = new Location();
    loc.name = l.name;
    loc.tag = l.tag;
    loc.description = l?.description;
    loc.coverImage = l?.coverImage;
    newLocations.push(loc);
  });

  return newLocations;
};

const addPhotographers = (photographers: IPhotographer[]): Photographer[] => {
  photographers.forEach((pg) => {
    const photog = Photographer.create({ ...pg });
    newPhotographers.push(photog);
  });
  return newPhotographers;
};

const addPhotos = (args: { photosCount: number }): Photo[] => {
  const newPhotos: Photo[] = [];

  for (let i = 0; i < args.photosCount; i++) {
    const newPhoto = new Photo();
    newPhoto.title = faker.lorem.words(5);

    newPhoto.description = faker.lorem.words(22);
    newPhoto.isFeatured = faker.random.boolean();
    newPhoto.isLimitedEdition = faker.random.boolean();
    newPhoto.rating = faker.random.number({ min: 4, max: 10 });
    newPhoto.basePrice = 375;
    newPhoto.priceModifier = 1.0;
    newPhoto.location = _.sample(newLocations) as Location;
    newPhoto.photographer = _.sample(newPhotographers) as Photographer;

    newPhotos.push(newPhoto);
  }
  return newPhotos;
};

const addSubjectsToPhotos = async (args: {
  sRepository: Repository<Subject>;
  pRepository: Repository<Photo>;
  psRepository: Repository<PhotoSubject>;
}) => {
  const [subjects, photos] = await Promise.all([
    args.sRepository.find(),
    args.pRepository.find(),
  ]);

  Promise.all(
    photos.map(async (photo) => {
      // get 2 subjects for each photo at random
      const subjectsForPhoto = _.sampleSize(subjects, 2);

      // create a PhotoSubject relationship for each pair
      const newPhotoSubjects: PhotoSubject[] = [];
      for await (const subject of subjectsForPhoto) {
        const ps = await args.psRepository.create({
          photo: photo,
          subject: subject,
        });
        newPhotoSubjects.push(ps);
      }
      await args.psRepository.insert(newPhotoSubjects).catch((e) => {
        console.error(e.message);
        process.exit(1);
      });
    })
  );
};

const addTagsToPhotos = async (args: {
  tRepository: Repository<Tag>;
  pRepository: Repository<Photo>;
  ptRepository: Repository<PhotoTag>;
}): Promise<boolean> => {
  const [tags, photos] = await Promise.all([
    args.tRepository.find(),
    args.pRepository.find(),
  ]);

  Promise.all(
    photos.map(async (photo) => {
      // get 2 subjects for each photo at random
      const tagsForPhoto = _.sampleSize(tags, 3);

      // create a PhotoSubject relationship for each pair
      const newPhotoTags: PhotoTag[] = [];
      for await (const tag of tagsForPhoto) {
        const pt = await args.ptRepository.create({
          photo: photo,
          tag: tag,
        });
        newPhotoTags.push(pt);
      }
      const result = await args.ptRepository.insert(newPhotoTags).catch((e) => {
        console.error(e.message);
        process.exit(1);
      });
      if (result) {
        return true;
      } else {
        return false;
      }
    })
  );
  return false;
};

const addPhotosToCollections = async (args: {
  pRepository: Repository<Photo>;
  cRepository: Repository<Collection>;
  pcRepository: Repository<PhotoCollection>;
}) => {
  const [collections, photos] = await Promise.all([
    args.cRepository.find(),
    args.pRepository.find(),
  ]);

  Promise.all(
    collections.map(async (collection) => {
      // get 9 photos for each collection at random
      const photosForCollection = _.sampleSize(photos, 9);

      // create a PhotoSubject relationship for each pair
      const newPhotoCollections: PhotoCollection[] = [];
      for await (const photo of photosForCollection) {
        const pc = await args.pcRepository.create({
          photo: photo,
          collection: collection,
        });
        newPhotoCollections.push(pc);
      }
      await args.pcRepository.insert(newPhotoCollections).catch((e) => {
        console.error(e.message);
        process.exit(1);
      });
    })
  );
};

// loop through every photo and create an image entity from data
const addImagesToPhotos = async (args: {
  pRepository: Repository<Photo>;
  iRepository: Repository<Image>;
}) => {
  const photos = await args.pRepository.find();

  Promise.all(
    photos.map(async (photo) => {
      // get image data for a single image
      const i: IImage = _.sample(imageData) as IImage;

      const newImg = await args.iRepository.create({
        ...i,
        photo: photo,
      });

      await args.iRepository.insert(newImg);
    })
  );
};

const addFinishesToPhotos = async (args: {
  pRepository: Repository<Photo>;
  fRepository: Repository<Finish>;
  pfRepository: Repository<PhotoFinish>;
}) => {
  const [finishes, photos] = await Promise.all([
    args.fRepository.find(),
    args.pRepository.find(),
  ]);

  // loop through each photo
  Promise.all(
    photos.map(async (photo) => {
      // create a PhotoFinish relationship between current photo and all finishes
      const newPhotoFinishes: PhotoFinish[] = [];
      for await (const finish of finishes) {
        const pf = await args.pfRepository.create({
          photo: photo,
          finish: finish,
        });
        newPhotoFinishes.push(pf);
      }
      await args.pfRepository.insert(newPhotoFinishes).catch((e) => {
        console.error(e.message);
        process.exit(1);
      });
    })
  );
};

const seed = async () => {
  // const connection = await createConnection();
  const getOptions = async () => {
    console.log(`getting DB options`);
    const connectionOptions: ConnectionOptions = {
      type: "postgres",
      synchronize: true,
      logging: false,
      namingStrategy: new SnakeNamingStrategy(),
    };
    if (process.env.NODE_ENV === "production") {
      Object.assign(connectionOptions, {
        url: process.env.DATABASE_URL,
        entities: ["dist/entities/*{.ts,.js}"],
      });
    } else {
      Object.assign(connectionOptions, {
        type: "postgres",
        host: "localhost",
        port: 5432,
        username: "postgres",
        password: "postgres",
        database: "photos",
        entities: ["src/entities/*{.ts,.js}", "dist/entities/*{.ts,.js}"],
      });
    }

    return connectionOptions;
  };

  const typeormconfig = await getOptions();
  const connection = await createConnection(typeormconfig);

  const photoRepository = await connection.getRepository(Photo);
  const photographerRepository = await connection.getRepository(Photographer);
  const locationRepository = await connection.getRepository(Location);
  const subjectRepository = await connection.getRepository(Subject);
  const photoSubjectRepository = await connection.getRepository(PhotoSubject);
  const tagRepository = await connection.getRepository(Tag);
  const photoTagRepository = await connection.getRepository(PhotoTag);
  const collectionRepository = await connection.getRepository(Collection);
  const photoCollectionRepository = await connection.getRepository(
    PhotoCollection
  );
  const imageRepository = await connection.getRepository(Image);
  const finishRepository = await connection.getRepository(Finish);
  const photoFinishRespository = await connection.getRepository(PhotoFinish);

  const photosCount = 200;
  const photoArgs = { photosCount };

  // * Subjects
  const newSubjects = addSubjects();

  await subjectRepository.insert(newSubjects).catch((e) => {
    console.error(e.message);
    process.exit(1);
  });

  console.log(`Added Subjects. Starting Tags.`);

  // * Tags
  const newTags = addTags();

  await tagRepository.insert(newTags).catch((e) => {
    console.error(e.message);
    process.exit(1);
  });

  console.log(`Added Tags. Starting Locations.`);

  // * Collections
  const newCollections = addCollections(collectionData);

  await collectionRepository.insert(newCollections).catch((e) => {
    console.error(e.message);
    process.exit(1);
  });

  // * Finishes
  const newFinishes = addFinishes(finishData);

  await finishRepository.insert(newFinishes).catch((e) => {
    console.error(e.message);
    process.exit(1);
  });

  // * Locations
  const newLocations = addLocations(locationData);

  await locationRepository.insert(newLocations).catch((e) => {
    console.error(e.message);
    process.exit(1);
  });

  console.log(`Starting to add photographers.`);

  // * Photographers
  const newPhotographers = addPhotographers(photographerData);
  await photographerRepository.insert(newPhotographers).catch((e) => {
    console.error(e.message);
    process.exit(1);
  });

  console.log(`Finished Photographers. Starting Photos.`);

  // * Photos
  const newPhotos = addPhotos(photoArgs);

  await photoRepository.insert(newPhotos).catch((e) => {
    console.error(e.message);
    process.exit(1);
  });

  //* update sku & sort indices
  Promise.all(
    newPhotos.map(async (photo) => {
      await photoRepository.update(photo.id, {
        sku: photo.skuGenerator + 1000,
        sortIndex: parseInt(photo.rating.toString() + photo.sku.toString()),
      });
    })
  );

  // * add subjects to photos
  await photoRepository.save;
  console.info(`Finished adding photos. Starting to add relationships.`);

  const sArgs = {
    pRepository: photoRepository,
    sRepository: subjectRepository,
    psRepository: photoSubjectRepository,
  };

  await addSubjectsToPhotos(sArgs);

  // * add tags to photoTags
  const tArgs = {
    pRepository: photoRepository,
    tRepository: tagRepository,
    ptRepository: photoTagRepository,
  };

  await addTagsToPhotos(tArgs);

  // * photos to collections
  const cArgs = {
    pRepository: photoRepository,
    cRepository: collectionRepository,
    pcRepository: photoCollectionRepository,
  };

  await addPhotosToCollections(cArgs);

  // * finishes to photos
  const fArgs = {
    pRepository: photoRepository,
    fRepository: finishRepository,
    pfRepository: photoFinishRespository,
  };

  await addFinishesToPhotos(fArgs);

  // * add images to photos
  const iArgs = {
    iRepository: imageRepository,
    pRepository: photoRepository,
  };

  await addImagesToPhotos(iArgs);

  // await connection.close();
  // console.info(`Successfully seeded database.`);

  // process.exit(0);
};

seed();
