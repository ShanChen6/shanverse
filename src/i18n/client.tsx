"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { getPathnameLocale, type Locale } from "./config";
import type { Messages, Translate } from "./messages";
import { getMessages, translate } from "./messages";

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
  const pathname = usePathname();
  const activeLocale = getPathnameLocale(pathname) ?? locale;
  const activeMessages = activeLocale === locale ? messages : getMessages(activeLocale);

  React.useEffect(() => {
    document.documentElement.lang = activeLocale;
  }, [activeLocale]);

  return (
    <I18nContext.Provider value={{ locale: activeLocale, messages: activeMessages }}>
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
