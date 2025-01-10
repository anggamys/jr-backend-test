import { IsArray, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ProductItemsDto } from './create-order.dto';

export class UpdateOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductItemsDto)
  @IsOptional()
  orderItems?: ProductItemsDto[];

  @IsOptional()
  totalPrice?: number;
}
