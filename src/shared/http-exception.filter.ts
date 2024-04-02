import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Response as APIReponse } from './types/types';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    const result: APIReponse<any> = {
      success: false,
      errorCode: status,
      host: request.path,
      errorMessage: exception.message,
      showType: 2,
      data: {},
    };

    response.status(status).json(result);
  }
}
