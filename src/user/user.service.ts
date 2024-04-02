import { Injectable } from '@nestjs/common';
import { CreateUserDto, LoginUserDto, UpdateUserDto } from './dto';
const jwt = require('jsonwebtoken');
import { UserRO } from './user.interface';
import { HttpException } from '@nestjs/common/exceptions/http.exception';
import { HttpStatus } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../shared/services/prisma.service';
import { ConfigService } from '@nestjs/config';

const select = {
  email: true,
  username: true,
  bio: true,
  image: true,
};

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  async findAll(): Promise<any[]> {
    return await this.prisma.user.findMany({ select });
  }

  async login(payload: LoginUserDto): Promise<any> {
    const _user = await this.prisma.user.findUnique({
      where: { email: payload.email },
    });

    const errors = { User: 'email or password wrong' };

    if (!_user) {
      throw new HttpException({ errors }, 401);
    }

    const authenticated = await bcrypt.compare(
      payload.password,
      _user.password,
    );

    if (!authenticated) {
      throw new HttpException({ errors }, 401);
    }

    const token = await this.generateJWT(_user);
    const { password, ...user } = _user;
    return {
      user: { token, ...user },
    };
  }

  async create(dto: CreateUserDto): Promise<UserRO> {
    const { username, email, password } = dto;

    // check uniqueness of username/email
    const userNotUnique = await this.prisma.user.findUnique({
      where: { email },
    });

    if (userNotUnique) {
      const errors = { username: 'Username and email must be unique.' };
      throw new HttpException(
        { message: 'Input data validation failed', errors },
        HttpStatus.BAD_REQUEST,
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const data = {
      username,
      email,
      password: hashedPassword,
    };
    const user = await this.prisma.user.create({ data, select });

    return { user };
  }

  async update(id: number, data: UpdateUserDto): Promise<any> {
    const where = { id };
    const user = await this.prisma.user.update({ where, data, select });

    return { user };
  }

  async delete(email: string): Promise<any> {
    return await this.prisma.user.delete({ where: { email }, select });
  }

  async findById(id: number): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, ...select },
    });
    return { user };
  }

  async findByEmail(email: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select,
    });
    return { user };
  }

  public generateJWT(user) {
    const today = new Date();
    const exp = new Date(today);
    exp.setDate(today.getDate() + 60);

    return jwt.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
        exp: exp.getTime() / 1000,
      },
      this.configService.get('JWT_SECRET'),
    );
  }
}
