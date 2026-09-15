import { cpfDigits, cpfLast4, formatCpf, isValidCpf } from "./cpf";

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
}

assert(isValidCpf("529.982.247-25"), "known valid CPF must pass");
assert(isValidCpf("52998224725"), "digits-only valid CPF must pass");
assert(!isValidCpf("111.111.111-11"), "repeated digits are invalid");
assert(!isValidCpf("123.456.789-00"), "wrong checksum is invalid");
assert(!isValidCpf("529.982.247-2"), "short CPF is invalid");
assert(cpfDigits("529.982.247-25") === "52998224725", "digits strip punctuation");
assert(formatCpf("52998224725") === "529.982.247-25", "format applies mask");
assert(cpfLast4("529.982.247-25") === "4725", "last4 is the check digits");

console.log("cpf tests passed");
