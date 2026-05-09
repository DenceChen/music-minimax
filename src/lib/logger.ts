import pino from 'pino';
import path from 'path';
import fs from 'fs';
import { randomUUID } from 'crypto';

const logsDir = path.join(process.cwd(), 'logs');

if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const today = new Date().toISOString().split('T')[0];
const logFile = path.join(logsDir, `app-${today}.log`);

export const logger = pino({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  formatters: {
    level: (label) => ({ level: label }),
  },
  timestamp: () => `,"timestamp":"${new Date().toISOString()}"`,
});

export function createModuleLogger(module: string) {
  return {
    info: (action: string, data?: object, durationMs?: number) => {
      logger.info({
        module,
        action,
        durationMs,
        ...data,
      });
    },
    error: (action: string, error: Error, context?: object) => {
      logger.error({
        module,
        action,
        error: error.message,
        stack: error.stack,
        ...context,
      });
    },
    warn: (action: string, data?: object) => {
      logger.warn({ module, action, ...data });
    },
    debug: (action: string, data?: object) => {
      logger.debug({ module, action, ...data });
    },
  };
}

export function generateRequestId(): string {
  return randomUUID();
}

// Create a write stream for file logging
export const logStream = fs.createWriteStream(logFile, { flags: 'a' });
