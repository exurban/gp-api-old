import {
  Arg,
  Field,
  FieldResolver,
  InputType,
  Int,
  Mutation,
  ObjectType,
  Resolver,
  Root,
} from "type-graphql";
import { Repository } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";

import Product from "../entities/Product";
import Photo from "../entities/Photo";
import Print from "../entities/Print";
import Mat from "../entities/Mat";
import Frame from "../entities/Frame";
import SuccessMessageResponse from "../abstract/SuccessMessageResponse";

//* Input Types
@InputType()
class AddProductInput {
  @Field()
  photo: Photo;

  @Field()
  print: Print;

  @Field({ nullable: true })
  mat?: Mat;

  @Field({ nullable: true })
  frame?: Frame;
}

@InputType()
class UpdateProductInput {
  @Field({ nullable: true })
  photo?: Photo;

  @Field({ nullable: true })
  print?: Print;

  @Field({ nullable: true })
  mat?: Mat;

  @Field({ nullable: true })
  frame?: Frame;
}

@ObjectType()
class AddProductResponse extends SuccessMessageResponse {
  @Field(() => Product, { nullable: true })
  newProduct?: Product;
}

@ObjectType()
class UpdateProductResponse extends SuccessMessageResponse {
  @Field(() => Product, { nullable: true })
  updatedProduct?: Product;
}

@Resolver(() => Product)
export default class ProductResolver {
  constructor(
    @InjectRepository(Product) private productRepository: Repository<Product>
  ) {}

  @FieldResolver()
  totalRetailPrice(@Root() product: Product) {
    // const dimension1 = product.print.dimension1;

    // ! update to get correct imageSize price from photo
    return (
      product.photo.retailPrice12 +
      product.mat.retailPrice +
      product.frame.retailPrice
    );
  }

  //* Mutations
  @Mutation(() => AddProductResponse)
  async addPrint(
    @Arg("input", () => AddProductInput) input: AddProductInput
  ): Promise<AddProductResponse> {
    const newProduct = await this.productRepository.create({
      photo: input.photo,
      print: input.print,
      mat: input.mat,
      frame: input.frame,
    });

    await this.productRepository.insert(newProduct);
    await this.productRepository.save(newProduct);

    return {
      success: true,
      message: `Successfully added item to your shopping bag.`,
      newProduct: newProduct,
    };
  }

  @Mutation(() => UpdateProductResponse)
  async updatePrint(
    @Arg("id", () => Int) id: number,
    @Arg("input", () => UpdateProductInput) input: UpdateProductInput
  ): Promise<UpdateProductResponse> {
    const product = await this.productRepository.findOne({ id });
    if (!product) {
      return {
        success: false,
        message: `Couldn't find product with id: ${id}`,
      };
    }

    const updatedProduct = { ...product, ...input };

    const pr = await this.productRepository.save(updatedProduct);

    return {
      success: true,
      message: `Successfully updated your order.`,
      updatedProduct: pr,
    };
  }

  @Mutation(() => SuccessMessageResponse)
  async deleteProduct(
    @Arg("id", () => Int) id: number
  ): Promise<SuccessMessageResponse> {
    const deleteResult = await this.productRepository.delete({ id });
    if (deleteResult && deleteResult.affected != 0) {
      return {
        success: true,
        message: `Successfully removed product from your shopping bag.`,
      };
    }
    return {
      success: false,
      message: `An error occurred. Failed to remove item from your shopping bag.`,
    };
  }
}
