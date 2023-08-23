import { T_AppErrorType } from './error_msg';

export class SysError extends Error {
  code: number;
  errors: any[] | undefined;
  details?: unknown;
  status: number;

  constructor(appErrorType: T_AppErrorType, errors?: any[], status?: number) {
    const [message, code] = appErrorType;
    super(message + ` &>${code || ''}`);
    this.code = code;
    this.errors = errors;
    this.status = status || 200;
  }
}

export class DtoError extends Error {
  code: number;
  errors: any[] | undefined;
  details?: unknown;
  status: number;

  constructor(message: string, code = 422, errors?: any[], status?: number) {
    super(message + ` &>${code || ''}`);
    this.errors = errors;
    this.code = code;
    this.status = status || 200;
  }
}
