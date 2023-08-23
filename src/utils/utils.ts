import * as _ from 'lodash';
import BigNumber from 'bignumber.js';

export function isEmpty(value?) {
  return _.isEmpty(value);
}

export function bigMinus(...args: BigNumber.Value[]) {
  let res = new BigNumber(args.shift());
  for (const arg of args) {
    res = res.minus(arg);
  }
  return res.toString(10);
}

export function bigMultiply(...args: BigNumber.Value[]) {
  let res = new BigNumber(1);
  for (const arg of args) {
    const a = new BigNumber(arg);
    res = a.multipliedBy(res);
  }
  return res.toNumber();
}

export function bigDiv(numA: BigNumber.Value, numB: BigNumber.Value): number {
  if (numB === 0) return 0;
  const a = new BigNumber(numA);
  const b = new BigNumber(numB);
  const res = a.dividedBy(b);
  return res.toNumber();
}

export function bigAdd(...args: BigNumber.Value[]) {
  let res = new BigNumber(0);
  for (const arg of args) {
    const a = new BigNumber(arg);
    res = a.plus(res);
  }
  return res.toNumber();
}

export function bigMod(a: BigNumber.Value, b: BigNumber.Value): number {
  const res = new BigNumber(a).mod(b);
  return res.toNumber();
}

export function getMimeType(filename: string): string {
  return filename.split('.').pop();
}
