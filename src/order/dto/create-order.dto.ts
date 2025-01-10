import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  Min,
  ValidateNested,
  IsPositive,
} from 'class-validator';
import { ProductDto } from 'src/product/dto/product.dto';

export class ProductItemsDto {
  @IsNumber()
  @IsNotEmpty()
  productId: number;

  @IsNumber()
  @IsNotEmpty()
  quantity: number;
}

export class CreateOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductItemsDto)
  orderItems: ProductItemsDto[];

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  totalPrice: number; // memastikan totalPrice adalah angka positif
}
