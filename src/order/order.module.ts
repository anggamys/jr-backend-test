import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { AuthModule } from 'src/auth/auth.module';
import { OrderService } from './order.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  providers: [OrderService],
  controllers: [OrderController],
  imports: [AuthModule, PrismaModule],
})
export class OrderModule {}
