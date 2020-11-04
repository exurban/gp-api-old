import {
  Arg,
  Authorized,
  Field,
  FieldResolver,
  Float,
  InputType,
  Int,
  Mutation,
  Query,
  Resolver,
  Root,
} from "type-graphql";
import { Repository } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";
import Finish from "../entities/Finish";

//* Input Types
@InputType()
class FinishInput {
  @Field()
  name: string;

  @Field()
  description: string;

  @Field()
  photoUrl: string;

  @Field()
  finSku: string;

  @Field(() => Float)
  width: number;

  @Field(() => Float)
  height: number;

  @Field(() => Float)
  depth: number;

  @Field(() => Float)
  weight: number;

  @Field(() => Float)
  shippingWeight: number;

  @Field(() => Float)
  basePrice: number;

  @Field(() => Float)
  priceModifier: number;
}

@InputType()
class FinishUpdateInput {
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  photoUrl?: string;

  @Field({ nullable: true })
  finSku?: string;

  @Field(() => Float, { nullable: true })
  width?: number;

  @Field(() => Float, { nullable: true })
  height?: number;

  @Field(() => Float, { nullable: true })
  depth?: number;

  @Field(() => Float, { nullable: true })
  weight?: number;

  @Field(() => Float, { nullable: true })
  shippingWeight?: number;

  @Field(() => Float, { nullable: true })
  basePrice?: number;

  @Field(() => Float, { nullable: true })
  priceModifier?: number;
}

@Resolver(() => Finish)
export default class FinishResolver {
  //* Repositories
  constructor(
    @InjectRepository(Finish)
    private finishRepository: Repository<Finish>
  ) {}

  //* Queries
  @Query(() => [Finish])
  finishes(): Promise<Finish[]> {
    return this.finishRepository.find();
  }

  @Query(() => Finish, { nullable: true })
  async finish(@Arg("id", () => Int) id: number) {
    return this.finishRepository.findOne(id);
  }

  //* Field Resolvers
  @FieldResolver(() => String)
  finishSku(@Root() finish: Finish) {
    return `${finish.finSku}-${finish.height}x${finish.width}`;
  }

  //* Mutations
  @Authorized("ADMIN")
  @Mutation(() => Finish)
  async addFinish(
    @Arg("input", () => FinishInput) input: FinishInput
  ): Promise<Finish> {
    return await this.finishRepository.create(input).save();
  }

  @Authorized("ADMIN")
  @Mutation(() => Finish, { nullable: true })
  async updateFinish(
    @Arg("id", () => Int) id: number,
    @Arg("input", () => FinishUpdateInput) input: FinishUpdateInput
  ): Promise<Finish | undefined> {
    const finish = await this.finishRepository.findOne({ id });
    if (!finish) {
      throw new Error(`No finish with an id of ${id} exists.`);
    }
    await this.finishRepository.update(id, { ...input });
    const updatedFinish = await this.finishRepository.findOne(id);
    return updatedFinish;
  }

  @Authorized("ADMIN")
  @Mutation(() => Boolean)
  async deleteFinish(@Arg("id", () => Int) id: number): Promise<boolean> {
    const deleteResult = await this.finishRepository.delete({ id });
    if (deleteResult && deleteResult.affected != 0) {
      return true;
    }
    return false;
  }
}
