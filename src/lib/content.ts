import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parse } from 'yaml';
import { z } from 'zod';

export const languages = ['en', 'es', 'fr'] as const;
export type Language = (typeof languages)[number];
export const languageNames = { en: 'English', es: 'Español', fr: 'Français' };
const nonempty = z.string().trim().min(1);
const date = z
  .string()
  .regex(/^\d{4}(-\d{2})?$/)
  .refine(
    (value) =>
      value.length === 4 || (+value.slice(5) >= 1 && +value.slice(5) <= 12),
    'Use YYYY or YYYY-MM',
  );
const link = z
  .url()
  .refine((value) => value.startsWith('https://'), 'Links must use HTTPS');
const profileSchema = z.object({
  publishReady: z.boolean(),
  name: nonempty,
  email: z.union([z.email(), z.literal('')]),
  location: z.string(),
  links: z.object({ linkedin: link.optional(), github: link.optional() }),
  experience: z.array(
    z.object({
      id: nonempty,
      company: nonempty,
      start: date,
      end: date.nullable(),
    }),
  ),
  degrees: z.array(
    z.object({
      id: nonempty,
      university: nonempty,
      officialTitle: nonempty,
      start: date,
      end: date.nullable(),
    }),
  ),
});
const localeSchema = z.object({
  title: nonempty,
  summary: z.string(),
  skills: z.array(
    z.object({ group: nonempty, items: z.array(nonempty).min(1) }),
  ),
  experience: z.record(
    z.string(),
    z.object({ role: nonempty, achievements: z.array(nonempty) }),
  ),
  degrees: z.record(z.string(), z.object({ description: z.string() })),
  ui: z.object(
    Object.fromEntries(
      [
        'navLabel',
        'languageLabel',
        'skip',
        'summary',
        'skills',
        'experience',
        'degrees',
        'contact',
        'contactIntro',
        'download',
        'present',
        'pending',
        'preview',
        'footer',
      ].map((key) => [key, nonempty]),
    ) as Record<string, typeof nonempty>,
  ),
});
function read<T>(file: string, schema: z.ZodType<T>): T {
  try {
    return schema.parse(parse(readFileSync(resolve(file), 'utf8')));
  } catch (error) {
    throw new Error(
      `Invalid content in ${file}: ${error instanceof Error ? error.message : error}`,
    );
  }
}
export const profile = read('content/profile.yaml', profileSchema);
for (const kind of ['experience', 'degrees'] as const) {
  const ids = profile[kind].map((entry) => entry.id);
  if (new Set(ids).size !== ids.length)
    throw new Error(`content/profile.yaml: duplicate ${kind} IDs`);
  for (const entry of profile[kind]) {
    if (entry.end && entry.end < entry.start)
      throw new Error(
        `content/profile.yaml: ${entry.id} ends before it starts`,
      );
  }
}
export const locales = Object.fromEntries(
  languages.map((lang) => {
    const file = `content/locales/${lang}.yaml`;
    const data = read(file, localeSchema);
    for (const kind of ['experience', 'degrees'] as const) {
      const expected = profile[kind].map((entry) => entry.id).sort();
      if (
        JSON.stringify(expected) !==
        JSON.stringify(Object.keys(data[kind]).sort())
      )
        throw new Error(
          `${file}: ${kind} IDs must exactly match content/profile.yaml`,
        );
    }
    if (
      profile.publishReady &&
      (!data.summary.trim() ||
        !data.skills.length ||
        !profile.experience.length ||
        !profile.degrees.length)
    )
      throw new Error(
        `${file}: summary, skills, experience and degrees are required before publication`,
      );
    return [lang, data];
  }),
) as Record<Language, z.infer<typeof localeSchema>>;
export const base = '/Online-CV/';
export const localePath = (lang: Language) =>
  `${base}${lang === 'en' ? '' : `${lang}/`}`;
export function displayDate(value: string, lang: Language) {
  if (value.length === 4) return value;
  return new Intl.DateTimeFormat(lang, {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${value}-01T00:00:00Z`));
}
