import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';

export class BaseController {
  constructor(private configService: ConfigService) {}

  protected getUserIdFromToken(authorization) {
    if (!authorization) return null;

    const token = authorization.split(' ')[1];
    const decoded: any = jwt.verify(
      token,
      this.configService.get('JWT_SECRET'),
    );
    return decoded.id;
  }
}
