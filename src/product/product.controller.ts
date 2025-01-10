import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  async createProduct(@Body() createProductDto: CreateProductDto) {
    return this.productService.createProduct(createProductDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getAllProducts() {
    return this.productService.getAllProducts();
  }

  @Post('search')
  @UseGuards(JwtAuthGuard)
  async searchProduct(@Body() searchProduct: { productId: number }) {
    return this.productService.getProductById(searchProduct);
  }
}
