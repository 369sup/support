import { trace } from "@opentelemetry/api";
import pino from "pino";
import type { Logger as PinoLogger, LoggerOptions as PinoLoggerOptions } from "pino";

export type LogAttributes = Readonly<Record<string, unknown>>;

export type LogLevel = "debug" | "error" | "info" | "silent" | "warn";

export interface Logger {
  child(attributes: LogAttributes): Logger;
  debug(message: string, attributes?: LogAttributes): void;
  error(message: string, error: unknown, attributes?: LogAttributes): void;
  info(message: string, attributes?: LogAttributes): void;
  warn(message: string, attributes?: LogAttributes): void;
}

export interface LogDestination {
  write(message: string): void;
}

export interface CreateLoggerOptions {
  base?: LogAttributes;
  destination?: LogDestination;
  level?: LogLevel;
}

const defaultRedactionPaths = [
  "authorization",
  "cookie",
  "password",
  "secret",
  "token",
  "headers.authorization",
  "headers.cookie",
  "*.authorization",
  "*.cookie",
  "*.password",
  "*.secret",
  "*.token",
  "req.headers.authorization",
  "req.headers.cookie",
  "request.headers.authorization",
  "request.headers.cookie",
];

export function resolveLogLevel(value: string | undefined): LogLevel {
  switch (value) {
    case undefined:
      return "info";
    case "debug":
    case "error":
    case "info":
    case "silent":
    case "warn":
      return value;
    default:
      return "info";
  }
}

function traceAttributes(): Record<string, string> {
  const spanContext = trace.getActiveSpan()?.spanContext();

  if (spanContext === undefined) {
    return {};
  }

  return {
    spanId: spanContext.spanId,
    traceId: spanContext.traceId,
  };
}

function writeLog(
  logger: PinoLogger,
  level: Exclude<LogLevel, "silent">,
  message: string,
  attributes?: LogAttributes,
): void {
  if (attributes === undefined) {
    logger[level](message);
    return;
  }

  logger[level](attributes, message);
}

function wrapLogger(logger: PinoLogger): Logger {
  return {
    child(attributes) {
      return wrapLogger(logger.child(attributes));
    },
    debug(message, attributes) {
      writeLog(logger, "debug", message, attributes);
    },
    error(message, error, attributes) {
      const serializedError =
        error instanceof Error ? error : new Error(String(error));
      logger.error({ ...attributes, err: serializedError }, message);
    },
    info(message, attributes) {
      writeLog(logger, "info", message, attributes);
    },
    warn(message, attributes) {
      writeLog(logger, "warn", message, attributes);
    },
  };
}

export function createLogger({
  base,
  destination,
  level = "info",
}: CreateLoggerOptions = {}): Logger {
  const options: PinoLoggerOptions = {
    level,
    mixin: traceAttributes,
    redact: {
      censor: "[REDACTED]",
      paths: defaultRedactionPaths,
    },
  };

  if (base !== undefined) {
    options.base = base;
  }

  const pinoLogger =
    destination === undefined
      ? pino(options)
      : pino(options, destination);

  return wrapLogger(pinoLogger);
}
