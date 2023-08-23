import { Controller, Get } from '@midwayjs/decorator';

@Controller('/api')
export class HomeController {
  @Get('/health')
  async health(): Promise<string> {
    return 'hello, chat-bot!';
  }
}
