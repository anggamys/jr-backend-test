import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UserDto } from 'src/users/dto/user.dto';
import { OrderStatus } from '@prisma/client';
import * as dayjs from 'dayjs';
import { UpdateOrderDto } from './dto/update-order.dto';
import { ProductDto } from 'src/product/dto/product.dto';

@Injectable()
export class OrderService {
  constructor(private readonly prismaService: PrismaService) {}

  async createOrder(createOrderDto: CreateOrderDto, userDto: UserDto) {
    const { orderItems, totalPrice } = createOrderDto;

    // Validasi input
    if (!orderItems || orderItems.length === 0 || !totalPrice) {
      throw new BadRequestException(
        'Item pesanan tidak boleh kosong dan harus memiliki total harga',
      );
    }

    if (!userDto || !userDto.name) {
      throw new BadRequestException('Data pengguna tidak lengkap');
    }

    const productIds = orderItems.map((item) => item.productId);
    const products = await this.prismaService.product.findMany({
      where: { id: { in: productIds } },
    });

    if (products.length !== orderItems.length) {
      throw new BadRequestException('Beberapa produk tidak valid');
    }

    for (const item of orderItems) {
      const product = products.find((p) => p.id === item.productId);
      if (!product) {
        throw new BadRequestException(
          `Produk dengan ID ${item.productId} tidak ditemukan`,
        );
      }
      if (product.stock < item.quantity) {
        throw new BadRequestException(
          `Stok tidak mencukupi untuk produk ${product.name}`,
        );
      }
    }

    const expiredTime = dayjs().add(1, 'hour').toDate();

    try {
      return await this.prismaService.$transaction(async (tx) => {
        const order = await tx.order.create({
          data: {
            userId: userDto.userId,
            customerName: userDto.name,
            customerPhone: userDto.phoneNumber || null,
            customerAddress: userDto.address || null,
            totalPrice,
            status: OrderStatus.PENDING,
            expiredAt: expiredTime,
          },
        });

        const createOrderItems = orderItems.map((item) => {
          const product = products.find((p) => p.id === item.productId);
          return tx.orderItem.create({
            data: {
              orderId: order.id,
              productId: item.productId,
              quantity: item.quantity,
              price: product.price,
            },
          });
        });

        const updateProductStocks = orderItems.map((item) =>
          tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          }),
        );

        await Promise.all([...createOrderItems, ...updateProductStocks]);

        return {
          status: 'success',
          message: 'Pesanan berhasil dibuat',
          orderId: order.id,
          expiredTime,
        };
      });
    } catch (error) {
      console.error('Error saat memproses pesanan:', error);
      throw new BadRequestException('Terjadi kesalahan saat memproses pesanan');
    }
  }

  async getUserOrder(userDto: UserDto) {
    // Mengambil pesanan berdasarkan userId dengan menyertakan item pesanan dan produk yang terkait
    const orders = await this.prismaService.order.findMany({
      where: { userId: userDto.userId },
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true, // Ambil data produk yang dibutuhkan saja
              },
            },
          },
        },
      },
    });

    // Jika tidak ada pesanan ditemukan
    if (orders.length === 0) {
      throw new NotFoundException(
        'Tidak ada pesanan ditemukan untuk pengguna ini',
      );
    }

    // Format response untuk hasil yang lebih rapi dan terstruktur
    const formattedOrders = orders.map((order) => ({
      id: Number(order.id),
      totalPrice: order.totalPrice,
      status: order.status,
      customerName: order.customerName,
      expiredAt: order.expiredAt,
      orderItems: order.orderItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        productName: item.product.name,
        productPrice: item.product.price,
        totalPrice: item.quantity * item.product.price, // Total harga item
      })),
    }));

    // Mengembalikan response yang terstruktur
    return {
      status: 'success',
      message: 'Pesanan berhasil diambil',
      data: formattedOrders,
    };
  }

  async getOrderById(orderId: number) {
    // Mengambil pesanan berdasarkan orderId dengan menyertakan item pesanan dan produk terkait
    const order = await this.prismaService.order.findUnique({
      where: { id: Number(orderId) }, // Pastikan orderId diubah menjadi number
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true, // Ambil data produk yang dibutuhkan saja
              },
            },
          },
        },
      },
    });

    // Jika pesanan tidak ditemukan
    if (!order) {
      throw new NotFoundException(
        `Pesanan dengan ID ${orderId} tidak ditemukan`,
      );
    }

    // Format response untuk hasil yang lebih terstruktur dan rapi
    const formattedOrder = {
      id: order.id,
      totalPrice: order.totalPrice,
      status: order.status,
      customerName: order.customerName,
      expiredAt: order.expiredAt,
      orderItems: order.orderItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        productName: item.product.name,
        productPrice: item.product.price,
        totalPrice: item.quantity * item.product.price, // Total harga item
      })),
    };

    // Mengembalikan response yang terstruktur
    return {
      status: 'success',
      message: 'Pesanan berhasil diambil',
      data: formattedOrder,
    };
  }

  async updateOrderStatus(
    orderId: number,
    userDto: UserDto,
    status: OrderStatus,
  ) {
    // Validasi orde id
    if (!orderId || isNaN(orderId)) {
      throw new BadRequestException('ID pesanan tidak valid');
    }

    // Menemukan pesanan berdasarkan orderId
    const order = await this.prismaService.order.findUnique({
      where: { id: Number(orderId) },
    });

    // Cek apakah pesanan ditemukan
    if (!order) {
      throw new NotFoundException(
        `Pesanan dengan ID ${orderId} tidak ditemukan`,
      );
    }

    // Pastikan pengguna hanya bisa mengubah pesanan mereka sendiri
    if (order.userId !== userDto.userId) {
      throw new ForbiddenException(
        'Anda tidak memiliki hak untuk mengubah pesanan ini',
      );
    }

    // Cek apakah pesanan sudah dibatalkan atau selesai
    if (order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException('Pesanan sudah dibatalkan');
    }

    if (order.status === OrderStatus.DONE) {
      throw new BadRequestException('Pesanan sudah diselesaikan');
    }

    // Update status pesanan
    const updatedOrder = await this.prismaService.order.update({
      where: { id: Number(order.id) },
      data: { status },
    });

    // Return response yang terstruktur dan jelas
    return {
      status: 'success',
      message: 'Status pesanan berhasil diperbarui',
      data: {
        orderId: updatedOrder.id,
        previousStatus: order.status,
        newStatus: status,
      },
    };
  }

  async updateOrderData(
    orderId: number,
    updateOrderDto: UpdateOrderDto,
    userDto: UserDto,
  ) {
    const { orderItems, totalPrice } = updateOrderDto;

    // Ambil data pesanan berdasarkan ID dan sertakan item pesanan terkait
    const order = await this.prismaService.order.findUnique({
      where: { id: Number(orderId) },
      include: { orderItems: true },
    });

    if (!order) {
      throw new NotFoundException(
        `Pesanan dengan ID ${orderId} tidak ditemukan`,
      );
    }

    // Pastikan pengguna adalah pemilik pesanan
    if (Number(order.userId) !== Number(userDto.userId)) {
      throw new ForbiddenException(
        'Anda tidak memiliki hak untuk mengubah pesanan ini',
      );
    }

    // Cegah pembaruan pada pesanan yang sudah dibatalkan atau selesai
    if (order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException('Pesanan sudah dibatalkan');
    }

    if (order.status === OrderStatus.DONE) {
      throw new BadRequestException('Pesanan sudah diselesaikan');
    }

    // Ambil data produk untuk memvalidasi ketersediaan stok
    const productIds = orderItems.map((item) => item.productId);
    const products = await this.prismaService.product.findMany({
      where: { id: { in: productIds } },
    });

    // Validasi ketersediaan stok dan cek produk
    for (const item of orderItems) {
      const product = products.find((p) => p.id === item.productId);
      if (!product) {
        throw new BadRequestException(
          `Produk dengan ID ${item.productId} tidak ditemukan`,
        );
      }
      if (product.stock < item.quantity) {
        throw new BadRequestException(
          `Stok tidak cukup untuk produk ${product.name}`,
        );
      }
    }

    // Melakukan pembaruan dalam transaksi
    return this.prismaService.$transaction(async (tx) => {
      let newTotalPrice = 0;

      // Update atau buat item pesanan
      for (const item of orderItems) {
        const existingOrderItem = order.orderItems.find(
          (oi) => oi.productId === item.productId,
        );

        const product = products.find((p) => p.id === item.productId);
        const productPrice = product?.price ?? 0;

        if (existingOrderItem) {
          // Update kuantitas item pesanan yang ada
          await tx.orderItem.update({
            where: { id: existingOrderItem.id },
            data: { quantity: item.quantity },
          });

          // Sesuaikan stok produk dengan mengurangi perubahan kuantitas
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: { decrement: item.quantity - existingOrderItem.quantity },
            },
          });
        } else {
          // Buat item pesanan baru jika tidak ada
          await tx.orderItem.create({
            data: {
              orderId: order.id,
              productId: item.productId,
              quantity: item.quantity,
              price: productPrice * item.quantity, // Harga dikalikan dengan kuantitas
            },
          });

          // Sesuaikan stok produk
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          });
        }

        // Tambah ke perhitungan total harga
        newTotalPrice += productPrice * item.quantity;
      }

      // Perbarui total harga pesanan
      await tx.order.update({
        where: { id: order.id },
        data: { totalPrice: newTotalPrice },
      });

      // Return data pesanan yang sudah diperbarui
      return {
        status: 'success',
        message: 'Pesanan berhasil diperbarui',
        orderId: order.id,
        OrderStatus: order.status,
        totalPrice: newTotalPrice,
        orderItems: orderItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: products.find((p) => p.id === item.productId)?.price ?? 0,
        })),
        expiredAt: new Date(Date.now() + 3600000), // Waktu kedaluwarsa 1 jam dari sekarang
      };
    });
  }

  async deleteOrder(orderId: number, userDto: UserDto) {
    // Cari pesanan berdasarkan ID
    const order = await this.prismaService.order.findUnique({
      where: { id: Number(orderId) },
      include: { orderItems: true },
    });

    // Cek apakah pesanan ada
    if (!order) {
      throw new NotFoundException(
        `Pesanan dengan ID ${orderId} tidak ditemukan`,
      );
    }

    // Pastikan pengguna adalah pemilik pesanan
    if (Number(order.userId) !== Number(userDto.userId)) {
      throw new ForbiddenException(
        'Anda tidak memiliki hak untuk menghapus pesanan ini',
      );
    }

    // Cegah penghapusan pada pesanan yang sudah dibatalkan atau selesai
    if (order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException('Pesanan sudah dibatalkan');
    }

    if (order.status === OrderStatus.DONE) {
      throw new BadRequestException('Pesanan sudah diselesaikan');
    }

    // Lakukan penghapusan dalam transaksi
    return this.prismaService.$transaction(async (tx) => {
      // Hapus item pesanan dan tambahkan stok produk kembali
      for (const item of order.orderItems) {
        // Hapus item pesanan
        await tx.orderItem.delete({ where: { id: item.id } });

        // Tambahkan stok produk kembali
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }

      // Hapus pesanan utama
      await tx.order.delete({ where: { id: order.id } });

      // Return response dengan informasi pesanan yang dihapus
      return {
        status: 'success',
        message: 'Pesanan berhasil dihapus',
        orderId: order.id,
      };
    });
  }
}
