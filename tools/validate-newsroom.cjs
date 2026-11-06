#!/usr/bin/env node
// Validate Newsroom data before publishing. No dependencies; run with Node.js.
const fs = require("node:fs");
const vm = require("node:vm");
const path = require("node:path");

const file = path.resolve(__dirname, "..", "newsroom-data.js");
const context = { window: {} };
try {
  vm.runInNewContext(fs.readFileSync(file, "utf8"), context, { filename: file });
} catch (error) {
  console.error(`[FAIL] newsroom-data.js syntax: ${error.message}`);
  process.exit(1);
}
const articles = context.window.AXRAL_ARTICLES;
if (!Array.isArray(articles)) {
  console.error("[FAIL] window.AXRAL_ARTICLES must be an array");
  process.exit(1);
}
const errors = [];
const ids = new Set();
const categories = new Set(["Company", "Product", "Update", "Event", "Media"]);
const blockTypes = new Set(["paragraph", "heading", "list", "quote"]);
const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const validDate = value => {
  if (!datePattern.test(value || "")) return false;
  const d = new Date(value + "T00:00:00Z");
  return !Number.isNaN(d.valueOf()) && d.toISOString().slice(0, 10) === value;
};
const check = (condition, message) => { if (!condition) errors.push(message); };

articles.forEach((a, i) => {
  const p = `articles[${i}]`;
  check(a && typeof a === "object", `${p}: must be an object`);
  if (!a || typeof a !== "object") return;
  check(typeof a.id === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(a.id), `${p}.id: use lowercase letters/numbers/hyphens`);
  if (a.id) { check(!ids.has(a.id), `${p}.id: duplicate "${a.id}"`); ids.add(a.id); }
  check(validDate(a.date), `${p}.date: invalid date "${a.date}" (expected real YYYY-MM-DD)`);
  check(categories.has(a.category), `${p}.category: unsupported "${a.category}"`);
  check(typeof a.title === "string" && a.title.trim(), `${p}.title: required`);
  check(typeof a.summary === "string" && a.summary.trim(), `${p}.summary: required`);
  check(Array.isArray(a.products), `${p}.products: must be an array`);
  check(Array.isArray(a.tags), `${p}.tags: must be an array`);
  check(typeof a.published === "boolean", `${p}.published: must be true/false`);
  check(Array.isArray(a.body), `${p}.body: must be an array`);
  (Array.isArray(a.body) ? a.body : []).forEach((b, j) => {
    check(b && blockTypes.has(b.type), `${p}.body[${j}]: unsupported block type`);
    if (b?.type === "list") check(Array.isArray(b.items) && b.items.length > 0, `${p}.body[${j}]: list needs items`);
    else check(typeof b?.text === "string" && b.text.trim(), `${p}.body[${j}]: text required`);
  });
});
if (errors.length) {
  console.error(`Newsroom validation failed (${errors.length}):\n- ${errors.join("\n- ")}`);
  process.exit(1);
}
const drafts = articles.filter(a => !a.published).length;
console.log(`Newsroom OK: ${articles.length} article(s), ${drafts} draft(s), ${articles.length - drafts} published.`);
