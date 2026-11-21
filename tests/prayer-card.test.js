// 기도카드 HTML 생성 시 이스케이프 검증 (XSS 방지)
// 실행: npm test
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { pathToFileURL } = require("node:url");

const SOURCE = path.join(__dirname, "..", "src", "utils", "prayerCard.js");

async function loadCardModule() {
  // 원본은 Vite용 ESM이라 임시 .mjs 사본으로 불러온다.
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "prayer-card-"));
  const file = path.join(dir, "prayerCard.mjs");
  fs.writeFileSync(file, fs.readFileSync(SOURCE, "utf8"), "utf8");
  return import(pathToFileURL(file).href);
}

test("기도카드 HTML에 들어가는 값은 이스케이프된다", async () => {
  const mod = await loadCardModule();

  let captured = "";
  const opened = [];
  globalThis.window = { open: (...args) => opened.push(args) };
  globalThis.Blob = class {
    constructor(parts) {
      captured = parts.join("");
    }
  };
  URL.createObjectURL = () => "blob:test";
  URL.revokeObjectURL = () => {};

  mod.openPrayerCard(
    {
      category: "missionary",
      country: '<img src=x onerror="alert(1)">',
      countryEn: "Iran",
      title: '</div><script>alert("xss")</script>',
      body: "본문 & <b>강조</b>",
      news: "<script>steal()</script>",
      newsSource: '"quote"',
      evangelicalRate: "0.3",
      churches: 300,
    },
    "2026-11-21"
  );

  assert.equal(opened.length, 1);
  assert.match(captured, /&lt;img src=x onerror=/);
  assert.doesNotMatch(captured, /<img src=x onerror="alert\(1\)">/);
  assert.doesNotMatch(captured, /<script>alert\("xss"\)<\/script>/);
  assert.doesNotMatch(captured, /<script>steal\(\)<\/script>/);
  assert.match(captured, /본문 &amp; &lt;b&gt;강조&lt;\/b&gt;/);
  // 국기 코드는 원본 값으로 계산되어야 한다
  assert.match(captured, /flagcdn\.com\/w80\/ir\.png/);
});

test("escapeHtml은 다섯 가지 특수문자를 모두 바꾼다", async () => {
  const { escapeHtml } = await loadCardModule();
  assert.equal(escapeHtml(`<>&"'`), "&lt;&gt;&amp;&quot;&#39;");
  assert.equal(escapeHtml(null), "");
  assert.equal(escapeHtml(0), "0");
});
