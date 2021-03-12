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
  @Field(() => Int)
  photoId: number;

  @Field(() => Int)
  printId: number;

  @Field(() => Int, { nullable: true })
  matId?: number;

  @Field(() => Int, { nullable: true })
  frameId?: number;
}

@InputType()
class UpdateProductInput {
  @Field(() => Int, { nullable: true })
  photoId?: number;

  @Field(() => Int, { nullable: true })
  printId?: number;

  @Field(() => Int, { nullable: true })
  matId?: number;

  @Field(() => Int, { nullable: true })
  frameId?: number;
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
    @InjectRepository(Product) private productRepository: Repository<Product>,
    @InjectRepository(Photo) private photoRepository: Repository<Photo>,
    @InjectRepository(Print) private printRepository: Repository<Print>,
    @InjectRepository(Mat) private matRepository: Repository<Mat>,
    @InjectRepository(Frame) private frameRepository: Repository<Frame>
  ) {}

  @FieldResolver()
  totalRetailPrice(@Root() product: Product) {
    let price;
    const dimension1 = product.print.dimension1;

    switch (dimension1) {
      case 12:
        price = product.photo.retailPrice12;
        break;
      case 16:
        price = product.photo.retailPrice16;
        break;
      case 20:
        price = product.photo.retailPrice20;
        break;
      case 24:
        price = product.photo.retailPrice24;
        break;
      default:
        price = product.photo.retailPrice30;
    }

    price += product.print.retailPrice;

    if (product.mat) {
      price += product.mat.retailPrice;
    }

    if (product.frame) {
      price += product.frame.retailPrice;
    }

    return price;
  }

  //* Mutations
  @Mutation(() => AddProductResponse)
  async addProduct(
    @Arg("input", () => AddProductInput) input: AddProductInput
  ): Promise<AddProductResponse> {
    const photo = await this.photoRepository.findOne(input.photoId);
    if (!photo) {
      return {
        success: false,
        message: `Failed to find photo with id ${input.photoId}`,
      };
    }

    const print = await this.printRepository.findOne(input.printId);
    if (!print) {
      return {
        success: false,
        message: `Failed to find print with id ${input.printId}`,
      };
    }

    let mat, frame;
    if (input.matId) {
      mat = await this.matRepository.findOne(input.matId);
      if (!mat) {
        return {
          success: false,
          message: `Failed to find mat with id ${input.matId}`,
        };
      }
    }

    if (input.frameId) {
      frame = await this.frameRepository.findOne(input.frameId);
      if (!frame) {
        return {
          success: false,
          message: `Failed to find frame with id ${input.frameId}`,
        };
      }
    }

    const newProduct = await this.productRepository.create({
      photo: photo,
      print: print,
      mat: mat,
      frame: frame,
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
  async updateProduct(
    @Arg("id", () => Int) id: number,
    @Arg("input", () => UpdateProductInput) input: UpdateProductInput
  ): Promise<UpdateProductResponse> {
    const product = await this.productRepository.findOne(id);

    if (!product) {
      return {
        success: false,
        message: `Product with id ${id} does not exist.`,
      };
    }

    let photo, print, mat, frame;

    if (input.photoId) {
      photo = await this.photoRepository.findOne({ id: input.photoId });
      if (!photo) {
        return {
          success: false,
          message: `Failed to find photo with id ${input.photoId}`,
        };
      }
      product.photo = photo;
    }

    if (input.printId) {
      print = await this.printRepository.findOne({ id: input.printId });
      if (!print) {
        return {
          success: false,
          message: `Failed to find print with id ${input.printId}`,
        };
      }
      product.print = print;
    }

    if (input.matId) {
      mat = await this.matRepository.findOne({ id: input.matId });
      if (!mat) {
        return {
          success: false,
          message: `Failed to find mat with id ${input.matId}`,
        };
      }
      product.mat = mat;
    }

    if (input.frameId) {
      frame = await this.frameRepository.findOne({ id: input.frameId });
      if (!frame) {
        return {
          success: false,
          message: `Failed to find frame with id ${input.frameId}`,
        };
      }
      product.frame = frame;
    }
    const pr = await this.productRepository.save(product);

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
