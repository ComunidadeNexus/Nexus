const REPEATED_DIGITS = new Set([
  "00000000000",
  "11111111111",
  "22222222222",
  "33333333333",
  "44444444444",
  "55555555555",
  "66666666666",
  "77777777777",
  "88888888888",
  "99999999999",
]);

export function cpfDigits(value: string): string {
  return (value || "").replace(/\D/g, "");
}

function verifierDigit(digits: string, factorStart: number): number {
  let sum = 0;
  for (let i = 0; i < factorStart - 1; i += 1) {
    sum += Number(digits[i]) * (factorStart - i);
  }
  const mod = (sum * 10) % 11;
  return mod === 10 ? 0 : mod;
}

export function isValidCpf(value: string): boolean {
  const digits = cpfDigits(value);
  if (digits.length !== 11) return false;
  if (REPEATED_DIGITS.has(digits)) return false;
  if (verifierDigit(digits, 10) !== Number(digits[9])) return false;
  if (verifierDigit(digits, 11) !== Number(digits[10])) return false;
  return true;
}

export function formatCpf(value: string): string {
  const digits = cpfDigits(value).slice(0, 11);
  const part1 = digits.slice(0, 3);
  const part2 = digits.slice(3, 6);
  const part3 = digits.slice(6, 9);
  const part4 = digits.slice(9, 11);
  if (digits.length <= 3) return part1;
  if (digits.length <= 6) return `${part1}.${part2}`;
  if (digits.length <= 9) return `${part1}.${part2}.${part3}`;
  return `${part1}.${part2}.${part3}-${part4}`;
}

export function cpfLast4(value: string): string {
  return cpfDigits(value).slice(-4);
}
