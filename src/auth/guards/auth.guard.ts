/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { CanActivate, ExecutionContext, Injectable, Logger, ParseUUIDPipe, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';
import { AuthService } from '../auth.service';
import { log } from 'console';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class AuthGuard implements CanActivate {

constructor( 
  private jwtService: JwtService,
  private authService: AuthService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean>{

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException('There is no bearer token');
    }
    try {

      const payload = await this.jwtService.verify(
        token,{secret: process.env.JWT_SEED}
      );
      
      console.log('TOKEN ', token)
      console.log('PAYLOAD ', payload)
      const user = await this.authService.findUserById( payload.id )
    
      if ( !user ) throw new UnauthorizedException('User does not exists');
      if ( !user.isActive) throw new UnauthorizedException('User is not active');

      request['user'] = user;


    } catch {
      throw new UnauthorizedException();
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers['authorization']?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

}
 