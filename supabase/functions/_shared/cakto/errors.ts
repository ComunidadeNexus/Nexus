export class CaktoError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.name = "CaktoError";
    this.status = status;
  }
}

export class CaktoNotConfiguredError extends CaktoError {
  constructor() {
    super("Cakto ainda não está configurada neste ambiente.", 503);
    this.name = "CaktoNotConfiguredError";
  }
}

export class CaktoSubaccountPendingError extends CaktoError {
  constructor() {
    super("Endpoint oficial de subconta Cakto pendente de confirmação.", 501);
    this.name = "CaktoSubaccountPendingError";
  }
}
