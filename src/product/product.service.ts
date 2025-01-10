import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';

@Injectable()
export class ProductService {
  constructor(private readonly prisma: PrismaService) {}

  async createProduct(createProductDto: CreateProductDto) {
    const { name, description, price, stock } = createProductDto;
    try {
      console.log('Membuat produk baru:', createProductDto);
      // Validasi data input
      if (!name || !description || !price || !stock) {
        throw new BadRequestException('Data produk tidak lengkap');
      }

      // Cek apakah produk dengan nama yang sama sudah ada
      const existingProduct = await this.prisma.product.findFirst({
        where: { name },
      });

      if (existingProduct) {
        throw new BadRequestException(
          `Produk dengan nama "${name}" sudah ada. Gunakan nama lain.`,
        );
      }

      // Membuat produk baru
      const product = await this.prisma.product.create({
        data: { name, description, price, stock },
      });

      return {
        statusCode: 201,
        message: 'Produk berhasil dibuat',
        data: product,
      };
    } catch (error) {
      console.error('Kesalahan saat membuat produk:', error.message);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Gagal membuat produk');
    }
  }

  async getAllProducts() {
    try {
      const products = await this.prisma.product.findMany();

      return {
        statusCode: 200,
        message: 'Daftar produk berhasil diambil',
        data: products,
      };
    } catch (error) {
      console.error('Kesalahan saat mengambil produk:', error.message);
      throw new BadRequestException('Gagal mengambil daftar produk');
    }
  }

  async getProductById(searchProduct: { productId: number }) {
    const { productId } = searchProduct;
    try {
      // Validasi ID produk
      if (!productId || isNaN(productId)) {
        throw new BadRequestException('ID produk tidak valid');
      }

      // Cari produk berdasarkan ID
      const product = await this.prisma.product.findUnique({
        where: { id: Number(productId) },
      });

      if (!product) {
        throw new NotFoundException(
          `Produk dengan ID ${productId} tidak ditemukan`,
        );
      }

      return {
        statusCode: 200,
        message: 'Produk berhasil diambil',
        data: product,
      };
    } catch (error) {
      console.error('Kesalahan saat mengambil produk:', error.message);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Gagal mengambil produk');
    }
  }
}
