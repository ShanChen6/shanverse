export type MessageTree = { readonly [key: string]: string | MessageTree };
export type WidenMessages<T> = { readonly [K in keyof T]: T[K] extends string ? string : T[K] extends Record<string, unknown> ? WidenMessages<T[K]> : never };
export type MessageKey<T, Prefix extends string = ""> = { [K in keyof T & string]: T[K] extends string ? `${Prefix}${K}` : T[K] extends Record<string, unknown> ? MessageKey<T[K], `${Prefix}${K}.`> : never }[keyof T & string];
export type TranslationValues = Readonly<Record<string, string | number>>;
