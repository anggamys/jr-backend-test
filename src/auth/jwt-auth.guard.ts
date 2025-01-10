import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly prismaService: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    // Cek apakah header Authorization ada dan valid
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException(
        'Header Authorization hilang atau format tidak valid',
      );
    }

    const token = authHeader.split(' ')[1];

    try {
      // Verifikasi token menggunakan JWT service
      const decoded = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET, // Pastikan ini sudah diatur di .env
      });

      // Ambil data pengguna dari database
      const user = await this.prismaService.user.findUnique({
        where: { email: decoded.email },
      });

      if (!user) {
        this.logger.warn(
          `Pengguna dengan email ${decoded.email} tidak ditemukan`,
        );
        throw new UnauthorizedException('Pengguna tidak ditemukan');
      }

      // Lampirkan data pengguna ke request object
      request.user = {
        ...decoded,
        userId: user.id,
        name: user.name,
        phoneNumber: user.phone,
        address: user.address,
        role: user.role,
      };

      return true;
    } catch (err) {
      // Penanganan error spesifik
      if (err.name === 'TokenExpiredError') {
        this.logger.warn('Token telah kedaluwarsa');
        throw new UnauthorizedException('Token telah kedaluwarsa');
      } else if (err.name === 'JsonWebTokenError') {
        this.logger.warn('Token tidak valid');
        throw new UnauthorizedException('Token tidak valid');
      } else {
        this.logger.error('Kesalahan tidak diketahui pada token', err.stack);
        throw new UnauthorizedException('Token tidak valid atau error lain');
      }
    }
  }
}
