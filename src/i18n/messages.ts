import en from "./messages/en";
import vi from "./messages/vi";
import type { Locale } from "./config";
import type { MessageKey, TranslationValues, WidenMessages } from "./messages/types";

export type Messages = WidenMessages<typeof vi>;
export type TranslationKey = MessageKey<typeof vi>;
export type Translate = (key: TranslationKey, values?: TranslationValues) => string;

const messages = { vi, en } as const satisfies Record<Locale, Messages>;

export function getMessages(locale: Locale): Messages {
  return messages[locale];
}

export function translate(messagesValue: Messages, key: TranslationKey, values?: TranslationValues): string {
  const value = key.split(".").reduce<unknown>((current, segment) => {
    if (!current || typeof current !== "object") return undefined;
    return (current as Record<string, unknown>)[segment];
  }, messagesValue);
  if (typeof value !== "string" || !value) {
    if (process.env.NODE_ENV !== "production") {
      throw new Error(`Missing translation: ${key}`);
    }
    return "";
  }
  if (!values) return value;
  return value.replace(/\{([a-zA-Z][a-zA-Z0-9_]*)\}/gu, (placeholder, name: string) =>
    Object.prototype.hasOwnProperty.call(values, name) ? String(values[name]) : placeholder,
  );
}
