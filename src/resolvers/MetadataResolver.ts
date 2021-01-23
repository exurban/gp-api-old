import { Field, ObjectType, Int, Query, Resolver } from "type-graphql";
import { Repository } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";
import Photo from "../entities/Photo";

@ObjectType()
class ItemCountList {
  @Field(() => [ItemCount])
  itemCountList: ItemCount[];
}

@ObjectType()
class ItemCount {
  @Field(() => String, { nullable: true })
  name: string;

  @Field(() => Int)
  count: number;
}

@Resolver()
export default class MetadataResolver {
  constructor(
    @InjectRepository(Photo) private photoRepository: Repository<Photo>
  ) {}

  @Query(() => ItemCountList)
  async photoCountBySubject(): Promise<ItemCountList> {
    const photosOfSubjectCounts = await this.photoRepository
      .createQueryBuilder("p")
      .select("COUNT(p.id)")
      .leftJoin("p.subjectsInPhoto", "ps")
      .leftJoin("ps.subject", "s", "s.id = ps.subjectId")
      .addSelect("s.name", "name")
      .groupBy("s.id")
      .getRawMany();

    return { itemCountList: photosOfSubjectCounts };
  }

  @Query(() => ItemCountList)
  async photoCountByTag(): Promise<ItemCountList> {
    const photosOfTagCounts = await this.photoRepository
      .createQueryBuilder("p")
      .select("COUNT(p.id)")
      .leftJoin("p.tagsForPhoto", "pt")
      .leftJoin("pt.tag", "t", "t.id = pt.tagId")
      .addSelect("t.name", "name")
      .groupBy("t.id")
      .getRawMany();

    return { itemCountList: photosOfTagCounts };
  }

  @Query(() => ItemCountList)
  async photoCountByCollection(): Promise<ItemCountList> {
    const photosOfCollectionCounts = await this.photoRepository
      .createQueryBuilder("p")
      .select("COUNT(p.id)")
      .innerJoin("p.collectionsForPhoto", "pc")
      .innerJoin("pc.collection", "c", "c.id = pc.collectionId")
      .addSelect("c.name", "name")
      .groupBy("c.id")
      .getRawMany();

    return { itemCountList: photosOfCollectionCounts };
  }

  @Query(() => ItemCountList)
  async photoCountByLocation(): Promise<ItemCountList> {
    const photosAtLocationsCounts = await this.photoRepository
      .createQueryBuilder("p")
      .select("COUNT(p.id)")
      .leftJoin("p.location", "l")
      .addSelect("l.name", "name")
      .groupBy("l.id")
      .getRawMany();

    return { itemCountList: photosAtLocationsCounts };
  }

  @Query(() => ItemCountList)
  async photoCountByPhotographer(): Promise<ItemCountList> {
    const photosByPhotographerCounts = await this.photoRepository
      .createQueryBuilder("p")
      .select("COUNT(p.id)")
      .leftJoin("p.photographer", "pg")
      .addSelect("pg.name", "name")
      .groupBy("pg.name")
      .getRawMany();

    return { itemCountList: photosByPhotographerCounts };
  }
}
// SELECT
// 	COUNT(p.id),
// 	l.name
// FROM
// 	photos p
// 	LEFT JOIN locations l ON p.location_id = l.id
// GROUP BY
// 	l.id
