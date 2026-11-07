/** Server-side log lines with one prefix, so they are easy to find in the host's log view. */
const PREFIX = "[shanverse]";

export const logger = {
  warn(message: string, details?: Record<string, unknown>) {
    if (details) console.warn(PREFIX, message, details);
    else console.warn(PREFIX, message);
  },
};
