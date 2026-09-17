"use client";

import * as React from "react";
import type { Locale } from "./config";
import type { Messages, Translate } from "./messages";
import { translate } from "./messages";

const I18nContext = React.createContext<{
  locale: Locale;
  messages: Messages;
} | null>(null);

export function I18nProvider({
  locale,
  messages,
  children,
}: {
  locale: Locale;
  messages: Messages;
  children: React.ReactNode;
}) {
  return (
    <I18nContext.Provider value={{ locale, messages }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = React.useContext(I18nContext);
  if (!context) throw new Error("useI18n must be used inside I18nProvider");
  const t = React.useCallback<Translate>(
    (key, values) => translate(context.messages, key, values),
    [context.messages],
  );
  return {
    locale: context.locale,
    t,
  };
}
