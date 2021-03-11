import PrintType from "../entities/PrintType";
import {
  Arg,
  Authorized,
  Field,
  FieldResolver,
  InputType,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  Root,
} from "type-graphql";
import Print from "../entities/Print";
import { Repository } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";
import SuccessMessageResponse from "../abstract/SuccessMessageResponse";

@InputType()
class AddPrintTypeInput {
  @Field()
  type: string;

  @Field()
  displayName: string;

  @Field()
  description: string;
}

@InputType()
class UpdatePrintTypeInput {
  @Field({ nullable: true })
  type?: string;

  @Field({ nullable: true })
  displayName?: string;

  @Field({ nullable: true })
  description?: string;
}

@InputType()
class SearchPrintTypesInput {
  @Field()
  searchString: string;
}

@ObjectType()
class SearchPrintTypesResponse {
  @Field(() => [PrintType])
  datalist: PrintType[];
}

@ObjectType()
class AddPrintTypeResponse extends SuccessMessageResponse {
  @Field(() => PrintType, { nullable: true })
  newPrintType?: PrintType;
}

@ObjectType()
class UpdatePrintTypeResponse extends SuccessMessageResponse {
  @Field(() => PrintType, { nullable: true })
  updatedPrintType?: PrintType;
}

@Resolver(() => PrintType)
export default class PrintTypeResolver {
  constructor(
    @InjectRepository(PrintType)
    private printTypeRepository: Repository<PrintType>,
    @InjectRepository(Print) private printRepository: Repository<Print>
  ) {}

  @FieldResolver()
  async lowestPriceForAspectRatio(
    @Root() printType: PrintType,
    @Arg("aspectRatio", () => String) aspectRatio: string
  ): Promise<number> {
    return await this.printRepository
      .createQueryBuilder("p")
      .select("MIN(p.basePrice)", "min")
      .where("p.type = :type", { type: printType.type })
      .andWhere("p.aspectRatio = :aspectRatio", { aspectRatio: aspectRatio })
      .getRawOne();
  }

  // * Queries
  @Query(() => PrintType)
  async printType(
    @Arg("id", () => Int) id: number
  ): Promise<PrintType | undefined> {
    return await PrintType.findOne(id);
  }

  @Query(() => SearchPrintTypesResponse)
  async searchPrintTypes(
    @Arg("input", () => SearchPrintTypesInput) input: SearchPrintTypesInput
  ): Promise<SearchPrintTypesResponse> {
    const searchString = input.searchString;

    const printTypes = await this.printTypeRepository
      .createQueryBuilder("pt")
      .where("pt.type ilike :searchString", {
        searchString: `%${searchString}%`,
      })
      .where("pt.displayName ilike :searchString", {
        searchString: `%${searchString}%`,
      })
      .orWhere("pt.description ilike :searchString", {
        searchString: `%${searchString}%`,
      })
      .getMany();

    const response = { datalist: printTypes };
    return response;
  }

  //* Mutations
  @Authorized("ADMIN")
  @Mutation(() => AddPrintTypeResponse)
  async addPrintType(
    @Arg("input", () => AddPrintTypeInput) input: AddPrintTypeInput
  ): Promise<AddPrintTypeResponse> {
    const newPrintType = await this.printTypeRepository.create(input);

    await this.printTypeRepository.insert(newPrintType);
    await this.printTypeRepository.save(newPrintType);

    return {
      success: true,
      message: `Successfully created new Mat: ${input.type}`,
      newPrintType: newPrintType,
    };
  }

  @Authorized("ADMIN")
  @Mutation(() => UpdatePrintTypeResponse)
  async updatePrintType(
    @Arg("id", () => Int) id: number,
    @Arg("input", () => UpdatePrintTypeInput) input: UpdatePrintTypeInput
  ): Promise<UpdatePrintTypeResponse> {
    const printType = await this.printTypeRepository.findOne({ id });
    if (!printType) {
      return {
        success: false,
        message: `Couldn't find printType with id: ${id}`,
      };
    }

    const updatedPrintType = { ...printType, ...input };

    const pt = await this.printTypeRepository.save(updatedPrintType);

    return {
      success: true,
      message: `Successfully updated ${pt.displayName}`,
      updatedPrintType: pt,
    };
  }

  @Authorized("ADMIN")
  @Mutation(() => Boolean)
  async deletePrintType(@Arg("id", () => Int) id: number): Promise<boolean> {
    const deleteResult = await this.printTypeRepository.delete({ id });
    if (deleteResult && deleteResult.affected != 0) {
      return true;
    }
    return false;
  }
}
