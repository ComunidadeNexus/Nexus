import { cpfDigits, cpfLast4, formatCpf, isValidCpf } from "./cpf";

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
}

function officialDigit(digits: string): number {
  let weight = digits.length + 1;
  let sum = 0;
  for (const char of digits) {
    sum += Number(char) * weight;
    weight -= 1;
  }
  const remainder = sum % 11;
  return remainder < 2 ? 0 : 11 - remainder;
}

function officialCpf(base9: string): string {
  const first = officialDigit(base9);
  const second = officialDigit(base9 + String(first));
  return base9 + String(first) + String(second);
}

const synthetic = officialCpf("123456789");
const zeroDigit = officialCpf("390533447");
const tampered = synthetic.slice(0, 10) + String((Number(synthetic[10]) + 1) % 10);
const masked = `${synthetic.slice(0, 3)}.${synthetic.slice(3, 6)}.${synthetic.slice(6, 9)}-${synthetic.slice(9)}`;

assert(synthetic.length === 11, "synthetic length");
assert(isValidCpf(synthetic), "official check digits must pass");
assert(isValidCpf(masked), "masked synthetic CPF must pass");
assert(isValidCpf(zeroDigit), "independent base with a zero check digit must pass");
assert(zeroDigit.includes("0"), "fixture exercises a zero digit");
assert(!isValidCpf(tampered), "tampered check digit is invalid");
assert(!isValidCpf("111.111.111-11"), "repeated digits are invalid");
assert(!isValidCpf("123.456.789-00"), "wrong checksum is invalid");
assert(!isValidCpf(synthetic.slice(0, 10)), "short CPF is invalid");
assert(cpfDigits(masked) === synthetic, "digits strip punctuation");
assert(formatCpf(synthetic) === masked, "format applies mask");
assert(cpfLast4(masked) === synthetic.slice(-4), "last4 is four characters");
assert(cpfLast4(masked).length === 4, "last4 length");

console.log("cpf tests passed");
