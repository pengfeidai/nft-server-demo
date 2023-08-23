export type T_AppErrorType = readonly [errorMessage: string, errorCode: number];

const _APP_ERROR_TYPES = {
  FORBIDDEN: ['Forbidden', 403],
} as const;

export const APP_ERROR_TYPES: { [P in keyof typeof _APP_ERROR_TYPES]: T_AppErrorType } = (() => {
  const codes = new Set<number>();
  for (const [msg, code] of Object.values(_APP_ERROR_TYPES)) {
    if (codes.has(code)) {
      throw new Error(`dup code ${msg} ${code}`);
    }
    codes.add(code);
  }
  return { ..._APP_ERROR_TYPES };
})();
