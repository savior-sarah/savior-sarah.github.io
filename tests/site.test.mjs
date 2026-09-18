import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (file) => readFileSync(join(root, file), "utf8");

test("required public files exist", () => {
  for (const file of [
    "index.html",
    "styles.css",
    "assets/photo.jpg",
    "assets/Siyuan_Ye_CV.pdf"
  ]) {
    assert.equal(existsSync(join(root, file)), true, `${file} is missing`);
  }
});

test("homepage exposes the required academic structure", () => {
  const html = read("index.html");
  assert.match(html, /<html lang="en">/);
  assert.match(html, /Siyuan Ye/);
  assert.match(html, /叶思远/);
  for (const id of ["research", "experience", "education", "more", "contact"]) {
    assert.match(html, new RegExp(`id="${id}"`));
  }
});

test("metadata identifies the canonical GitHub Pages site", () => {
  const html = read("index.html");
  assert.match(html, /<title>Siyuan Ye \| Machine Learning Undergraduate Researcher<\/title>/);
  assert.match(html, /name="description" content="[^"]+"/);
  assert.match(html, /rel="canonical" href="https:\/\/savior-sarah\.github\.io\/"/);
  assert.match(html, /property="og:title"/);
  assert.match(html, /property="og:description"/);
});

test("public contact and asset links are correct", () => {
  const html = read("index.html");
  assert.match(html, /mailto:siyuanye@umich\.edu/);
  assert.match(html, /https:\/\/github\.com\/savior-sarah/);
  assert.match(html, /href="assets\/Siyuan_Ye_CV\.pdf"/);
  assert.match(html, /src="assets\/photo\.jpg"/);
  assert.match(html, /alt="Portrait of Siyuan Ye"/);
});

test("all tracked text files contain only approved public contact details", () => {
  const tracked = execFileSync("git", ["ls-files", "-z"], { cwd: root, encoding: "utf8" })
    .split("\0").filter(Boolean);
  assert.ok(tracked.length > 0, "tracked publication inventory is empty");
  // Binary assets receive a separate PDF and image audit before publication.
  const binaryAssets = new Set(["assets/photo.jpg", "assets/Siyuan_Ye_CV.pdf"]);
  const phone = /(?<!\w)(?:\+?1[\s.-]*)?\(?[2-9]\d{2}\)?[\s.-]*[2-9]\d{2}[\s.-]*\d{4}(?!\w)/;
  const email = /[A-Z0-9._%+-]+@[A-Z0-9-]+(?:\.[A-Z0-9-]+)+/gi;
  const applicationToken = new RegExp(["SL", "ED"].join(""), "i");
  for (const file of tracked.filter((file) => !binaryAssets.has(file))) {
    const content = read(file);
    assert.ok(!content.includes("\0"), `${file}: unexpected binary file needs review`);
    assert.ok(!phone.test(content), `${file}: phone number found`);
    assert.ok(!applicationToken.test(content), `${file}: application-specific text found`);
    for (const address of content.match(email) ?? []) {
      assert.equal(address.toLowerCase(), "siyuanye@umich.edu", `${file}: unapproved email found`);
    }
  }
});

test("homepage has no remote runtime dependency", () => {
  const html = read("index.html");
  assert.doesNotMatch(html, /<script[^>]+src=["']https?:/i);
  assert.doesNotMatch(html, /<link[^>]+rel=["']stylesheet["'][^>]+href=["']https?:/i);
});

test("styles define the approved palette and accessible interaction states", () => {
  const css = read("styles.css");
  for (const token of ["--page", "--ink", "--muted", "--blue", "--powder", "--warm", "--line"]) {
    assert.match(css, new RegExp(`${token}:`));
  }
  assert.match(css, /:focus-visible/);
  assert.match(css, /:focus-visible\s*\{[^}]*outline:\s*3px solid var\(--blue-dark\)/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
});

test("styles contain desktop, mobile, and print layouts", () => {
  const css = read("styles.css");
  assert.match(css, /grid-template-columns/);
  assert.match(css, /@media \(max-width:\s*760px\)/);
  assert.match(css, /@media print/);
});

test("mobile navigation keeps every primary link visible", () => {
  const css = read("styles.css");
  assert.doesNotMatch(css, /nav a:nth-child\(2\),\s*nav a:nth-child\(3\)\s*\{\s*display:\s*none/);
});

test("GitHub Pages deployment files are present", () => {
  for (const file of ["404.html", ".nojekyll", "README.md"]) {
    assert.equal(existsSync(join(root, file)), true, `${file} is missing`);
  }
  const fallback = read("404.html");
  assert.match(fallback, /href="\/"/);
  assert.match(fallback, /Page not found/);
});

test("README documents preview, tests, and Pages publishing", () => {
  const readme = read("README.md");
  assert.match(readme, /npm test/);
  assert.match(readme, /python -m http\.server 4173/);
  assert.match(readme, /savior-sarah\.github\.io/);
  assert.match(readme, /Deploy from a branch/);
});
