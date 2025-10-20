import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(value: number | bigint, decimals = 9): string {
  const num = typeof value === 'bigint' ? Number(value) / Math.pow(10, decimals) : value;

  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(2) + 'M';
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(2) + 'K';
  }
  return num.toFixed(decimals > 2 ? 4 : 2);
}

export function formatTokenAmount(amount: bigint, decimals = 9): string {
  return (Number(amount) / Math.pow(10, decimals)).toFixed(4);
}

export function parseTokenAmount(amount: string, decimals = 9): bigint {
  const num = parseFloat(amount);
  if (isNaN(num)) return 0n;
  return BigInt(Math.floor(num * Math.pow(10, decimals)));
}
