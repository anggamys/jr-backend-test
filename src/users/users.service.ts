import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(createUserDto: CreateUserDto) {
    const { name, email, password, phoneNumber, address, role } = createUserDto;

    // Cek apakah pengguna sudah ada berdasarkan email
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new HttpException(
        `Pengguna dengan email "${email}" sudah terdaftar`,
        HttpStatus.BAD_REQUEST,
      );
    }

    // Lanjutkan pembuatan pengguna baru
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone: phoneNumber,
        address,
        role,
      },
    });

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Pengguna berhasil dibuat',
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  async findUserByEmail(email: string) {
    try {
      // Validasi input email
      if (!email) {
        throw new HttpException('Email harus diisi', HttpStatus.BAD_REQUEST);
      }

      // Cari pengguna berdasarkan email
      const user = await this.prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        throw new HttpException(
          `Pengguna dengan email "${email}" tidak ditemukan`,
          HttpStatus.NOT_FOUND,
        );
      }

      return {
        statusCode: HttpStatus.OK,
        message: 'Pengguna berhasil ditemukan',
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          password: user.password,
        },
      };
    } catch (error) {
      console.error('Kesalahan saat mencari pengguna:', error.message);
      throw new HttpException(
        'Gagal mencari pengguna',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
