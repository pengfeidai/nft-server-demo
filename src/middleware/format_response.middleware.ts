import { IMiddleware } from '@midwayjs/core';
import { Middleware, App } from '@midwayjs/decorator';
import { NextFunction, Context, Application } from '@midwayjs/koa';
import * as stream from 'stream';
import { SysError } from '../common/sys_error';

@Middleware()
export class FormatMiddleware implements IMiddleware<Context, NextFunction> {
  @App()
  app: Application;

  resolve() {
    return async (ctx: Context, next: NextFunction) => {
      try {
        const data = await next();
        if (data instanceof stream.Readable || Buffer.isBuffer(data)) {
          ctx.body = data;
          return;
        }

        return {
          code: 0,
          msg: 'success',
          data,
        };
      } catch (err) {
        ctx.app.emit('error', err, ctx);
        const sysErr = err as SysError;
        const [message, code] = sysErr.message.split(' &>');
        const status = sysErr.status || 500;
        if (this.app.getEnv() !== 'prod' || status === 500) ctx.app.emit('error', err, ctx);

        ctx._internalError = sysErr;
        const error = status === 500 && ['production', 'prod'].includes(this.app.getEnv()) ? 'Internal Server Error' : message;

        ctx.body = {
          code: parseInt(code) || status,
          data: null,
          msg: error,
        };
        ctx.status = status;
      }
    };
  }

  static getName(): string {
    return 'format';
  }
}
