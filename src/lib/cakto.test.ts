import { producerStatusLabel } from "./producerStatus";

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
}

assert(producerStatusLabel("none") === "Conta financeira não configurada", "none label");
assert(producerStatusLabel("pending") === "Cadastro em análise", "pending label");
assert(producerStatusLabel("under_review") === "Cadastro em análise", "review label");
assert(producerStatusLabel("approved") === "Conta aprovada", "approved label");
assert(producerStatusLabel("rejected") === "Conta recusada", "rejected label");
assert(producerStatusLabel("suspended") === "Conta suspensa", "suspended label");

console.log("cakto tests passed");
