import * as dotenv from 'dotenv';
dotenv.config();

import { Configuration, App, Inject, Config } from '@midwayjs/decorator';

import * as koa from '@midwayjs/koa';
import * as swagger from '@midwayjs/swagger';
import * as validate from '@midwayjs/validate';
import * as crossDomain from '@midwayjs/cross-domain';
import { join } from 'path';
import { ILogger } from '@midwayjs/logger';
import * as axios from '@midwayjs/axios';
import * as i18n from '@midwayjs/i18n';
import * as cache from '@midwayjs/cache';

import { NotFoundFilter } from './filter/notfound.filter';
import { AccessLogMiddleware } from './middleware/access_log.middleware';
import { FormatMiddleware } from './middleware/format_response.middleware';
import { AuthMiddleware } from './middleware/auth.middleware';

@Configuration({
  imports: [
    koa,
    validate,
    crossDomain,
    axios,
    i18n,
    cache,
    {
      component: swagger,
      enabledEnvironment: [process.env.SWAGGER_ENABLE_ENV],
    },
  ],
  importConfigs: [join(__dirname, './config')],
})
export class ContainerLifeCycle {
  @App()
  app: koa.Application;

  @Inject()
  logger: ILogger;

  @Config('koa')
  koaConfig;

  async onReady(): Promise<void> {
    this.app.useMiddleware([AccessLogMiddleware, FormatMiddleware, AuthMiddleware]);
    this.app.useFilter([NotFoundFilter]);

    this.logger.info(`Application start success 🚀🚀 port: ${this.koaConfig.port}`);
  }
}
