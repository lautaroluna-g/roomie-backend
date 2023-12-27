/* eslint-disable prettier/prettier */

import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema()
export class User {

    _id?: string;
    
    @Prop({required:true, unique: true})
    email: string;

    @Prop({required:true, unique: true})
    username: string;

    @Prop({required:true})
    name:string;

    @Prop({required:true, unique: true, minlength: 6})
    password?: string;

    @Prop({default: true})
    isActive: boolean;
}

export const userSchema = SchemaFactory.createForClass( User ) 