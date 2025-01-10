import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UserDto } from 'src/users/dto/user.dto';
import { OrderStatus } from '@prisma/client';
import { UpdateOrderDto } from './dto/update-order.dto';

@UseGuards(JwtAuthGuard)
@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  async createOrder(
    @Body() createOrderDto: CreateOrderDto,
    @Request() req: any,
  ) {
    const userDto: UserDto = req.user;
    return this.orderService.createOrder(createOrderDto, userDto);
  }

  @Get()
  async getUserOrder(@Request() req: any) {
    const userDto: UserDto = req.user;
    return this.orderService.getUserOrder(userDto);
  }

  @Get(':id')
  async getOrderById(@Param('id') orderId: number) {
    return this.orderService.getOrderById(orderId);
  }

  @Post(':id/pay-now')
  async payOrder(@Param('id') orderId: number, @Request() req: any) {
    const userDto: UserDto = req.user;
    return this.orderService.updateOrderStatus(
      orderId,
      userDto,
      OrderStatus.DONE,
    );
  }

  @Put(':id')
  async updateOrderData(
    @Param('id') orderId: number,
    @Body() updateOrderDto: UpdateOrderDto,
    @Request() req: any,
  ) {
    const userDto: UserDto = req.user;
    return this.orderService.updateOrderData(orderId, updateOrderDto, userDto);
  }

  @Delete(':id')
  async deleteOrder(@Param('id') orderId: number, @Request() req: any) {
    const userDto: UserDto = req.user;
    return this.orderService.deleteOrder(orderId, userDto);
  }
}
