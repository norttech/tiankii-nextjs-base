import { buildEnv } from "@/lib/config/env";

// ─── Cloud Logging Severity Levels ────────────────────────────────────────────
// https://cloud.google.com/logging/docs/reference/v2/rest/v2/LogEntry#LogSeverity

type Severity = "DEBUG" | "INFO" | "WARNING" | "ERROR" | "CRITICAL";

// ─── Structured Log Context ──────────────────────────────────────────────────

export interface HttpRequestContext {
  method?: string;
  url?: string;
  status?: number;
  userAgent?: string;
  remoteIp?: string;
  latency?: string;
}

export interface LogContext {
  /** Caller module or component name (e.g. "auth", "payments") */
  component?: string;
  /** Cloud Trace ID — automatically parsed by Cloud Logging */
  trace?: string;
  /** Span ID for distributed tracing */
  spanId?: string;
  /** HTTP request metadata — automatically parsed by Cloud Logging */
  httpRequest?: HttpRequestContext;
  /** Arbitrary key-value labels for filtering in Cloud Logging */
  labels?: Record<string, string>;
  /** Additional structured data to include in the log entry */
  [key: string]: unknown;
}

// ─── Structured Log Entry (Cloud Logging format) ─────────────────────────────

interface StructuredLogEntry {
  severity: Severity;
  message: string;
  timestamp: string;
  component?: string;
  "logging.googleapis.com/trace"?: string;
  "logging.googleapis.com/spanId"?: string;
  httpRequest?: HttpRequestContext;
  "logging.googleapis.com/labels"?: Record<string, string>;
  error?: {
    message: string;
    stack?: string;
    name?: string;
  };
  [key: string]: unknown;
}

// ─── Dev-mode Colors ─────────────────────────────────────────────────────────

const COLORS = {
  DEBUG: "\x1b[36m", // cyan
  INFO: "\x1b[32m", // green
  WARNING: "\x1b[33m", // yellow
  ERROR: "\x1b[31m", // red
  CRITICAL: "\x1b[35m", // magenta
  RESET: "\x1b[0m",
  DIM: "\x1b[2m",
  BOLD: "\x1b[1m",
} as const;

// ─── Logger Implementation ───────────────────────────────────────────────────

const isDev = buildEnv.NODE_ENV === "development";

function buildEntry(
  severity: Severity,
  message: string,
  context?: LogContext,
  error?: unknown,
): StructuredLogEntry {
  const { component, trace, spanId, httpRequest, labels, ...extra } = context ?? {};

  const entry: StructuredLogEntry = {
    severity,
    message,
    timestamp: new Date().toISOString(),
  };

  if (component) entry.component = component;
  if (trace) entry["logging.googleapis.com/trace"] = trace;
  if (spanId) entry["logging.googleapis.com/spanId"] = spanId;
  if (httpRequest) entry.httpRequest = httpRequest;
  if (labels) entry["logging.googleapis.com/labels"] = labels;

  // Spread any extra fields
  Object.assign(entry, extra);

  // Attach error details
  if (error instanceof Error) {
    entry.error = {
      message: error.message,
      stack: error.stack,
      name: error.name,
    };
  } else if (error !== undefined) {
    entry.error = { message: String(error) };
  }

  return entry;
}

function writeLog(
  severity: Severity,
  message: string,
  context?: LogContext,
  error?: unknown,
): void {
  const entry = buildEntry(severity, message, context, error);

  if (isDev) {
    writeDev(entry);
  } else {
    writeJson(entry);
  }
}

/**
 * Production: Write structured JSON to stdout/stderr.
 * Cloud Run's logging agent parses this automatically.
 */
function writeJson(entry: StructuredLogEntry): void {
  const output = JSON.stringify(entry);

  if (entry.severity === "ERROR" || entry.severity === "CRITICAL") {
    process.stderr.write(`${output}\n`);
  } else {
    process.stdout.write(`${output}\n`);
  }
}

/**
 * Development: Write human-readable, colored output to the console.
 */
function writeDev(entry: StructuredLogEntry): void {
  const color = COLORS[entry.severity];
  const time = new Date(entry.timestamp).toLocaleTimeString("en-US", {
    hour12: false,
  });

  const prefix = entry.component ? `${COLORS.DIM}[${entry.component}]${COLORS.RESET} ` : "";

  const line = `${COLORS.DIM}${time}${COLORS.RESET} ${color}${COLORS.BOLD}${entry.severity.padEnd(8)}${COLORS.RESET} ${prefix}${entry.message}`;

  if (entry.severity === "ERROR" || entry.severity === "CRITICAL") {
    process.stderr.write(`${line}\n`);
    if (entry.error?.stack) {
      process.stderr.write(`${COLORS.DIM}${entry.error.stack}${COLORS.RESET}\n`);
    }
  } else {
    process.stdout.write(`${line}\n`);
  }

  // Print extra context if present
  const {
    severity: _,
    message: __,
    timestamp: ___,
    component: ____,
    error: _____,
    ...extra
  } = entry;
  const cleaned = Object.fromEntries(
    Object.entries(extra).filter(([key]) => !key.startsWith("logging.googleapis.com")),
  );
  if (Object.keys(cleaned).length > 0) {
    process.stdout.write(`${COLORS.DIM}  ↳ ${JSON.stringify(cleaned)}${COLORS.RESET}\n`);
  }
}

// ─── Public API ──────────────────────────────────────────────────────────────

export const logger = {
  /**
   * Fine-grained informational events useful during development/debugging.
   * Suppressed in production Cloud Logging unless log level is lowered.
   */
  debug(message: string, context?: LogContext) {
    writeLog("DEBUG", message, context);
  },

  /**
   * Normal operational messages — no action required.
   */
  info(message: string, context?: LogContext) {
    writeLog("INFO", message, context);
  },

  /**
   * Something unexpected happened but the app can continue.
   */
  warn(message: string, context?: LogContext) {
    writeLog("WARNING", message, context);
  },

  /**
   * A significant error occurred — should be investigated.
   * Optionally attach the causal error.
   */
  error(message: string, error?: unknown, context?: LogContext) {
    writeLog("ERROR", message, context, error);
  },

  /**
   * A critical failure — the service may be unable to continue.
   * Optionally attach the causal error.
   */
  critical(message: string, error?: unknown, context?: LogContext) {
    writeLog("CRITICAL", message, context, error);
  },

  /**
   * Create a child logger scoped to a component.
   * Inherits all context and prepends the component name.
   */
  child(component: string, baseContext?: Omit<LogContext, "component">) {
    const merged = { component, ...baseContext };
    return {
      debug: (msg: string, ctx?: LogContext) => writeLog("DEBUG", msg, { ...merged, ...ctx }),
      info: (msg: string, ctx?: LogContext) => writeLog("INFO", msg, { ...merged, ...ctx }),
      warn: (msg: string, ctx?: LogContext) => writeLog("WARNING", msg, { ...merged, ...ctx }),
      error: (msg: string, err?: unknown, ctx?: LogContext) =>
        writeLog("ERROR", msg, { ...merged, ...ctx }, err),
      critical: (msg: string, err?: unknown, ctx?: LogContext) =>
        writeLog("CRITICAL", msg, { ...merged, ...ctx }, err),
    };
  },
};
