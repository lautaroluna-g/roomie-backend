/* eslint-disable prettier/prettier */
import { IsEmail, MinLength } from "class-validator";


export class LoginDto {

    @IsEmail()
    username: string;

    @MinLength(6)
    password:string;
    
}