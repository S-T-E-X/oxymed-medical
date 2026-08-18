/**
 * Generates the non-Turkish site dictionaries from the Turkish source files.
 *
 *   pnpm --filter @workspace/scripts run translate-i18n            # missing keys only
 *   pnpm --filter @workspace/scripts run translate-i18n -- --force # retranslate everything
 *   pnpm --filter @workspace/scripts run translate-i18n -- --locale de --namespace gcp
 *
 * Turkish files under artifacts/oxymed-medikal/src/i18n/locales/tr are the
 * source of truth. Existing translations are preserved by default so hand
 * corrections are never silently overwritten.
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pLimit from "p-limit";
import pRetry from "p-retry";
import { openai } from "@workspace/integrations-openai-ai-server";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const LOCALES_DIR = path.resolve(HERE, "../../artifacts/oxymed-medikal/src/i18n/locales");

const NAMESPACES = ["common", "seo", "home", "products", "gcp", "ams", "dvp", "dvs", "service", "quote", "news"] as const;

/** Target languages. Turkish is the source and is never generated. */
const TARGETS: Array<{ code: string; englishName: string }> = [
  { code: "en", englishName: "English" },
  { code: "de", englishName: "German" },
  { code: "fr", englishName: "French" },
  { code: "it", englishName: "Italian" },
  { code: "ar", englishName: "Arabic" },
  { code: "ru", englishName: "Russian" },
  { code: "fa", englishName: "Persian (Farsi)" },
  { code: "ka", englishName: "Georgian" },
  { code: "bg", englishName: "Bulgarian" },
  { code: "az", englishName: "Azerbaijani" },
  { code: "es", englishName: "Spanish" },
];

type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

function isPlainObject(value: Json): value is { [key: string]: Json } {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Returns the parts of `source` that are missing from `existing`, so a rerun
 * only pays for newly added keys.
 */
function missingSubtree(source: Json, existing: Json | undefined): Json | undefined {
  if (existing === undefined) return source;

  if (isPlainObject(source)) {
    if (!isPlainObject(existing)) return source;
    const diff: { [key: string]: Json } = {};
    for (const [key, value] of Object.entries(source)) {
      const sub = missingSubtree(value, existing[key]);
      if (sub !== undefined) diff[key] = sub;
    }
    return Object.keys(diff).length > 0 ? diff : undefined;
  }

  if (Array.isArray(source)) {
    // Arrays are translated as a unit: length changes mean the list changed.
    if (!Array.isArray(existing) || existing.length !== source.length) return source;
    return undefined;
  }

  return undefined;
}

/** Deep merge translated output over what is already on disk. */
function mergeDeep(base: Json, overlay: Json): Json {
  if (isPlainObject(base) && isPlainObject(overlay)) {
    const result: { [key: string]: Json } = { ...base };
    for (const [key, value] of Object.entries(overlay)) {
      result[key] = key in base ? mergeDeep(base[key]!, value) : value;
    }
    return result;
  }
  return overlay;
}

/**
 * Reorders `translated` to follow the key order of `source` and drops keys that
 * no longer exist in Turkish, so files stay diffable and don't accumulate junk.
 */
function alignToSource(source: Json, translated: Json): Json {
  if (isPlainObject(source)) {
    const result: { [key: string]: Json } = {};
    const from = isPlainObject(translated) ? translated : {};
    for (const [key, value] of Object.entries(source)) {
      result[key] = key in from ? alignToSource(value, from[key]!) : value;
    }
    return result;
  }
  if (Array.isArray(source)) {
    return Array.isArray(translated) && translated.length === source.length ? translated : source;
  }
  return typeof translated === "string" || typeof translated === "number" || typeof translated === "boolean"
    ? translated
    : source;
}

function systemPrompt(englishName: string): string {
  return [
    `You are a professional medical-device marketing translator. Translate the JSON values from Turkish into ${englishName}.`,
    "",
    "HARD RULES:",
    `1. Return ONLY valid JSON with EXACTLY the same keys, nesting and array lengths as the input. Translate VALUES only, never keys.`,
    `2. This is B2B marketing and technical copy for hospital and dental equipment (medical gas systems, bed head units, pendant systems, dental vacuum pumps, amalgam separators). Use the correct established industry terminology in ${englishName}, not literal word-for-word translation.`,
    "3. Keep the register and length close to the source. Strings that are ALL CAPS in Turkish stay ALL CAPS. Strings that are short UI labels must stay short enough for a button or nav item.",
    "4. NEVER translate: brand names (Oxymed, Oxymed Medikal), product model codes, standards and certifications (ISO 9001, ISO 13485, ISO 11143, CE), units and technical values (bar, mm, °C, VAC, 220 VAC, 50/60 Hz), gas symbols (O2, VAC, AIR, AGS, N2O), phone numbers, e-mail addresses and URLs.",
    "5. Keep any {{placeholder}} tokens exactly as they appear.",
    "",
    "CRITICAL MARKETING RULE — domestic production claims:",
    "The Turkish copy contains claims like 'YERLİ ÜRETİM', 'yerli üretim' and '%100 yerli sermaye ile yüksek kalite üretim'. These mean 'domestically produced in Turkey' and only make sense to a Turkish audience.",
    `For ${englishName}, DO NOT translate these literally. Replace them with a direct-from-the-manufacturer message that carries the same trust value for an international buyer, for example a title meaning 'DIRECT FROM THE MANUFACTURER' / 'FACTORY DIRECT' and a description meaning 'High-quality production and direct sales from our own factory'. Keep it the same length and tone as the Turkish original, and keep it in the same key.`,
    "",
    "Output raw JSON only — no markdown fences, no commentary.",
  ].join("\n");
}

async function translateChunk(payload: Json, englishName: string): Promise<Json> {
  const completion = await openai.chat.completions.create({
    model: "gpt-5.6-terra",
    messages: [
      { role: "system", content: systemPrompt(englishName) },
      { role: "user", content: JSON.stringify(payload, null, 2) },
    ],
    response_format: { type: "json_object" },
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) throw new Error(`Empty translation response for ${englishName}`);
  return JSON.parse(raw) as Json;
}

async function readJson(file: string): Promise<Json | undefined> {
  if (!existsSync(file)) return undefined;
  try {
    return JSON.parse(await readFile(file, "utf8")) as Json;
  } catch {
    return undefined;
  }
}

/** Translates one locale/namespace pair. Returns a short status for logging. */
async function translateFile(
  target: { code: string; englishName: string },
  namespace: string,
  force: boolean,
): Promise<string> {
  const sourceFile = path.join(LOCALES_DIR, "tr", `${namespace}.json`);
  const source = await readJson(sourceFile);
  if (!source || (isPlainObject(source) && Object.keys(source).length === 0)) {
    return `skip ${target.code}/${namespace} — Turkish source is empty`;
  }

  const outFile = path.join(LOCALES_DIR, target.code, `${namespace}.json`);
  const existing = force ? undefined : await readJson(outFile);
  const pending = force ? source : missingSubtree(source, existing);

  if (pending === undefined) return `ok   ${target.code}/${namespace} — up to date`;

  const translated = await pRetry(() => translateChunk(pending, target.englishName), {
    retries: 3,
    minTimeout: 2000,
    onFailedAttempt: (ctx) =>
      console.log(`  retry ${target.code}/${namespace} (attempt ${ctx.attemptNumber}): ${ctx.error.message}`),
  });

  const merged = existing ? mergeDeep(existing, translated) : translated;
  const aligned = alignToSource(source, merged);
  await writeFile(outFile, `${JSON.stringify(aligned, null, 2)}\n`, "utf8");
  return `done ${target.code}/${namespace}`;
}

async function main() {
  const args = process.argv.slice(2);
  const force = args.includes("--force");
  const onlyLocale = args[args.indexOf("--locale") + 1];
  const onlyNamespace = args[args.indexOf("--namespace") + 1];

  const targets = args.includes("--locale") ? TARGETS.filter((t) => t.code === onlyLocale) : TARGETS;
  const namespaces = args.includes("--namespace")
    ? NAMESPACES.filter((n) => n === onlyNamespace)
    : [...NAMESPACES];

  if (targets.length === 0) throw new Error(`Unknown locale: ${onlyLocale}`);
  if (namespaces.length === 0) throw new Error(`Unknown namespace: ${onlyNamespace}`);

  await Promise.all(targets.map((t) => mkdir(path.join(LOCALES_DIR, t.code), { recursive: true })));

  // Each file is an independent request; run several at once so a full
  // 10-language regeneration finishes in minutes instead of an hour.
  const limit = pLimit(6);
  const work = targets.flatMap((target) =>
    namespaces.map((namespace) =>
      limit(async () => {
        try {
          console.log(`  ${await translateFile(target, namespace, force)}`);
        } catch (error) {
          console.error(`  FAIL ${target.code}/${namespace}:`, (error as Error).message);
          throw error;
        }
      }),
    ),
  );

  const results = await Promise.allSettled(work);
  const failed = results.filter((r) => r.status === "rejected").length;
  console.log(failed === 0 ? "Done." : `Done with ${failed} failed file(s) — rerun to retry them.`);
  if (failed > 0) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
