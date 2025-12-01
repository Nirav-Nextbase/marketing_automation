export class Logger {
  constructor(private scope: string) {}

  info(message: string, data?: Record<string, unknown>) {
    // Add structured log to ease debugging
    console.log(`[${this.scope}] ${message}`, data ?? '');
  }

  error(message: string, error?: unknown) {
    console.error(`[${this.scope}] ${message}`, error);
  }
}

export const createLogger = (scope: string) => new Logger(scope);

