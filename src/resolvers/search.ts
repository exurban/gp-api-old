import { Arg, createUnionType, Query, Resolver } from "type-graphql";
import Tag from "../entities/Tag";
import Subject from "../entities/Subject";
import Location from "../entities/Location";
import { Repository } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";

const UserSearchResultUnion = createUnionType({
  name: "UserSearchResult",
  types: () => [Subject, Tag, Location] as const,
  resolveType: (value) => {
    if ("photosOfSubject" in value) {
      return Subject;
    }
    if ("photosWithTag" in value) {
      return Tag;
    }
    if ("tag" in value) {
      return Location;
    }
    return undefined;
  },
});

@Resolver()
export default class UserSearchResolver {
  // * Repositories
  constructor(
    @InjectRepository(Subject) private subjectRepository: Repository<Subject>,
    @InjectRepository(Tag) private tagRepository: Repository<Tag>,
    @InjectRepository(Location) private locationRepository: Repository<Location>
  ) {}

  @Query(() => [UserSearchResultUnion])
  async userSearch(
    @Arg("phrase", () => String) phrase: string
  ): Promise<Array<typeof UserSearchResultUnion>> {
    const tags = await this.tagRepository
      .createQueryBuilder("t")
      .where("t.name ilike :phrase", { phrase: `%${phrase}%` })
      .orWhere("t.description ilike :phrase", { phrase: `%${phrase}%` })
      .getMany();

    const subjects = await this.subjectRepository
      .createQueryBuilder("s")
      .where("s.name ilike :phrase", { phrase: `%${phrase}%` })
      .orWhere("s.description ilike :phrase", { phrase: `%${phrase}%` })
      .getMany();

    const locations = await this.locationRepository
      .createQueryBuilder("l")
      .where("l.name ilike :phrase", { phrase: `%${phrase}%` })
      .orWhere("l.tag ilike :phrase", { phrase: `%${phrase}%` })
      .orWhere("l.description ilike :phrase", { phrase: `%${phrase}%` })
      .getMany();

    return [...subjects, ...tags, ...locations];
  }
}
