#!/usr/bin/env node
/**
 * i18n consistency checker (dependency-free).
 *
 * Polish (`pl.json`) is the source of truth; English (`en.json`) is the
 * translation target. The script flattens both locale files to dotted keys
 * (descending into nested objects and arrays, matching how `t("a.b.0.c")`
 * resolves at runtime) and reports:
 *
 *   ERROR  orphan keys defined in `en` but missing from `pl`
 *   WARN   empty string values (sometimes intentional - e.g. a suppressed subtitle)
 *   WARN   keys present in `pl` but not yet translated in `en` (coverage)
 *
 * Exit code is non-zero when an ERROR is found. Pass `--strict` (or set
 * `I18N_STRICT=1`) to also fail on coverage gaps - use that when adding new
 * copy, so every new key lands in both languages.
 *
 * Usage:  node scripts/check-i18n.mjs [--strict]
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const localesDir = path.join(here, "..", "src", "locales");
const SOURCE = "pl";
const TARGET = "en";
const strict = process.argv.includes("--strict") || process.env.I18N_STRICT === "1";

const read = (lng) => JSON.parse(fs.readFileSync(path.join(localesDir, `${lng}.json`), "utf8"));

/** Flatten to { "a.b.0.c": "value" } so nested objects and arrays are comparable. */
const flatten = (value, prefix = "", acc = {}) => {
    if (Array.isArray(value)) {
        value.forEach((item, index) => flatten(item, prefix ? `${prefix}.${index}` : String(index), acc));
    } else if (value && typeof value === "object") {
        for (const [key, child] of Object.entries(value)) {
            flatten(child, prefix ? `${prefix}.${key}` : key, acc);
        }
    } else {
        acc[prefix] = value;
    }
    return acc;
};

const source = flatten(read(SOURCE));
const target = flatten(read(TARGET));
const sourceKeys = new Set(Object.keys(source));
const targetKeys = new Set(Object.keys(target));

const orphans = [...targetKeys].filter((k) => !sourceKeys.has(k)).sort();
const missing = [...sourceKeys].filter((k) => !targetKeys.has(k)).sort();
const empties = [
    ...Object.entries(source)
        .filter(([, v]) => v === "")
        .map(([k]) => `${SOURCE}:${k}`),
    ...Object.entries(target)
        .filter(([, v]) => v === "")
        .map(([k]) => `${TARGET}:${k}`),
].sort();

const list = (items, limit = 50) =>
    items
        .slice(0, limit)
        .map((k) => `    - ${k}`)
        .join("\n") + (items.length > limit ? `\n    …and ${items.length - limit} more` : "");

let errors = 0;

console.log(
    `i18n check - source "${SOURCE}" (${sourceKeys.size} keys), target "${TARGET}" (${targetKeys.size} keys)\n`
);

if (orphans.length) {
    errors++;
    console.log(`ERROR: ${orphans.length} key(s) in ${TARGET}.json are missing from ${SOURCE}.json (orphans):`);
    console.log(list(orphans) + "\n");
}

if (empties.length) {
    console.log(`WARN: ${empties.length} empty translation value(s) (intentional in some flows):`);
    console.log(list(empties) + "\n");
}

if (missing.length) {
    const label = strict ? "ERROR" : "WARN";
    if (strict) errors++;
    console.log(`${label}: ${missing.length} key(s) in ${SOURCE}.json not yet translated in ${TARGET}.json:`);
    console.log(list(missing) + "\n");
}

if (!orphans.length && !empties.length && !missing.length) {
    console.log("✓ Locales are in sync.");
} else if (!strict && !errors) {
    console.log("No blocking errors. Re-run with --strict to enforce full translation coverage.");
}

process.exit(errors ? 1 : 0);
