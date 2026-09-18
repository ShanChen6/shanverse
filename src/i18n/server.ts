import "server-only";

import { headers } from "next/headers";
import { defaultLocale, isLocale, localeHeader, type Locale } from "./config";
import { getMessages, translate, type Translate } from "./messages";

export async function getLocale(): Promise<Locale> {
  const value = (await headers()).get(localeHeader);
  return isLocale(value) ? value : defaultLocale;
}

export async function getTranslator() {
  const locale = await getLocale();
  const localeMessages = getMessages(locale);
  const t: Translate = (key, values) => translate(localeMessages, key, values);
  return { locale, t };
}
