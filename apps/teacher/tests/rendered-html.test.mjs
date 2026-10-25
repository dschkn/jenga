import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const developmentPreviewMeta =
  /<meta(?=[^>]*\bname=["']codex-preview["'])(?=[^>]*\bcontent=["']development["'])[^>]*>/i;

test("renders development preview metadata", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  const response = await worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );

  assert.equal(response.status, 200);
  assert.match(
    response.headers.get("content-type") ?? "",
    /^text\/html\b/i,
  );
  const html = await response.text();
  assert.match(html, developmentPreviewMeta);
  assert.match(html, /Jenga/);
  assert.match(html, /jenga-icon\.png/);
  assert.doesNotMatch(html, /deutsch[- ]?klub|dk-logo|dk-mark/i);
});

test("keeps teacher availability slots neutral and repeatable", async () => {
  const source = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");

  assert.doesNotMatch(source, new RegExp("Да" + "ша|Ше" + "рина"));
  assert.doesNotMatch(source, /draftTrial[^\n]+kind/);
  assert.match(source, /Выберите удобные дату и время, когда вы сможете провести пробное занятие, консультацию или тестирование\./);
  assert.equal(source.match(/slot-add-button/g)?.length, 2);
  assert.match(source, /calendarCellCount = Math\.max\(35,/);
});

test("clips lesson accents inside rounded cards", async () => {
  const styles = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

  assert.match(styles, /\.lesson-card \{[\s\S]*?overflow: clip;[\s\S]*?contain: paint;/);
  assert.match(styles, /\.lesson-accent \{[\s\S]*?inset: 0 auto 0 0;/);
});

