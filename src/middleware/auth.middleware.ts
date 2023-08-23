import { Inject } from '@midwayjs/decorator';
import { ILogger } from '@midwayjs/logger';
import { IMiddleware } from '@midwayjs/core';
import { Middleware } from '@midwayjs/decorator';
import { NextFunction, Context } from '@midwayjs/koa';
import { SysError } from '../common/sys_error';
import { APP_ERROR_TYPES } from '../common/error_msg';

@Middleware()
export class AuthMiddleware implements IMiddleware<Context, NextFunction> {
  @Inject()
  logger: ILogger;

  resolve() {
    return async (ctx: Context, next: NextFunction) => {
      const { authorization } = ctx.request.header;

      if (!authorization) throw new SysError(APP_ERROR_TYPES.FORBIDDEN);

      try {
        // TODO：权限校验
        ctx.auth = {};
        await next();
      } catch (err) {
        this.logger.error('AuthMiddleware error:', err);
        throw err;
      }
    };
  }

  ignore(ctx: Context): boolean {
    const router = ['/api/health'];
    const swaggerRegExp = /\/swagger-u.*/u;
    const match = router.includes(ctx.path) || swaggerRegExp.test(ctx.path);

    return match;
  }

  static getName(): string {
    return 'authorization';
  }
}
