import { MidwayConfig } from '@midwayjs/core';

export default {
  midwayLogger: {
    default: {
      dir: '/app/logs',
      maxFiles: '7d',
    },
    clients: {
      coreLogger: {
        level: 'info',
        consoleLevel: 'warn',
      },
      appLogger: {
        level: 'info',
        consoleLevel: 'warn',
      },
    },
  },
} as MidwayConfig;
