/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcryptjs from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-payload.interface';


import { User } from './entities/user.entity';
import { LoginResponse } from './interfaces/login-response.interfaces';
import { CreateUserDto, LoginDto, RegisterUserDto, UpdateAuthDto } from './dto';

@Injectable()
export class AuthService {

  constructor(
    @InjectModel( User.name)
    private userModel: Model<User>,
    private jwtService: JwtService

  ) {}


  async create(createUserDto: CreateUserDto): Promise<User>{
    try {
      const {password, ...userData} = createUserDto

      // Encriptamos la contraseña
      const newUser = new this.userModel({
        password: bcryptjs.hashSync(password,8), 
        ...userData
      })
      
      await newUser.save()
      
      const {password:_, ...user} = newUser.toJSON()

      return user

    } catch (error) {
      console.log(error.code)
      if (error.code ===11000){
        throw new BadRequestException(`${createUserDto.email} already exist`)
      }
    }
  }


  async register(registerDto: RegisterUserDto): Promise<LoginResponse>{
    const user = await this.create(registerDto);
    const resp = {
      user: user,
      token: this.getJWT({id:user._id})
    }
    return resp
  }

  async login(loginDTO: LoginDto): Promise<LoginResponse>{

    const {username, password} = loginDTO

    const user = await this.userModel.findOne({username});

    if (!user) {
      throw new UnauthorizedException()
    }

    if (!bcryptjs.compareSync(password, user.password)){
      throw new UnauthorizedException()
    }

    const {password:_, ...other} = user.toJSON()
    
    return {
      user: other,
      token:this.getJWT({id:user.id})
    }
  }

  getJWT( payload: JwtPayload){
    const token= this.jwtService.sign(payload,{secret:process.env.JWT_SEED})
    return token
  }

  findAll(): Promise<User[]> {
    return this.userModel.find();
  }

  async findUserById( id: string) {
    console.log('ID ', id);
    const user = await this.userModel.findById(id)
    console.log(' user ', user)
    const {password, ...rest} = user.toJSON()
    return rest
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}
