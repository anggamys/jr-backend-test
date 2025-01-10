import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import * as bcrypt from 'bcryptjs';
import { LoginDto } from './dto/login.dto';
import { UserDto } from 'src/users/dto/user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    // Validasi data input
    const { email, password } = loginDto;
    if (!email || !password) {
      throw new HttpException(
        'Email dan password harus diisi',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Memeriksa apakah pengguna dengan email yang diberikan ada
    const user = await this.userService.findUserByEmail(loginDto.email);

    // Jika pengguna tidak ditemukan
    if (!user) {
      throw new HttpException(
        'Email atau password salah', // Pesan kesalahan umum
        HttpStatus.UNAUTHORIZED,
      );
    }

    // Memeriksa kecocokan password pengguna
    const isPasswordMatch = await bcrypt.compare(
      loginDto.password,
      user.data.password,
    );

    // Jika password tidak cocok
    if (!isPasswordMatch) {
      throw new HttpException(
        'Email atau password salah', // Pesan kesalahan umum
        HttpStatus.UNAUTHORIZED,
      );
    }

    // Payload yang akan digunakan untuk membuat token
    const payload = {
      userId: user.data.id,
      email: user.data.email,
      role: user.data.role,
    };

    // Mengembalikan respon login berhasil dengan token
    return {
      statusCode: HttpStatus.OK,
      message: 'Login berhasil',
      data: {
        token: this.jwtService.sign(payload),
      },
    };
  }
}
