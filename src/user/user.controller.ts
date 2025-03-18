import { Controller, Post, Body, Get, Req, HttpException, HttpStatus } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    try {
      const user = await this.userService.register(createUserDto);
      return { message: 'Usuário registrado com sucesso', user };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    const user = await this.userService.validateUser(body.email, body.password);
    if (!user) {
      throw new HttpException('Credenciais inválidas', HttpStatus.UNAUTHORIZED);
    }

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET não definido');
    }
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    return { user, token };
  }

  @Get('me')
  async getMe(@Req() req: Request) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new HttpException('Token não fornecido', HttpStatus.UNAUTHORIZED);
    }

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET não definido');
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      throw new HttpException('Token inválido', HttpStatus.UNAUTHORIZED);
    }

    const userId = decoded.userId;
    const user = await this.userService.findById(userId);

    if (!user) {
      throw new HttpException('Usuário não encontrado', HttpStatus.NOT_FOUND);
    }

    return { user };
  }
}
