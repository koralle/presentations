import { AxeBuilder } from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

import { TOTAL } from "./fixture/params";

/**
 * axe に WCAG 2.0 / 2.1 / 2.2 の A・AA 相当のルールだけを走らせる（best-practice の
 * ルールまで含めると、デッキの中身（利用者のスライド）の指摘が混ざる）。
 *
 * 自動検出できるのは一部だけなので、これは「手で確かめない」ためのものではない。
 */
const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

const scan = async (page: Page) => {
  const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
  // violations を丸ごと比べると、失敗メッセージが axe の実装詳細（該当 HTML の
  // 断片など）で埋まる。どのルールがどの要素で落ちたかだけを出す。
  expect(
    results.violations.map((violation) => ({
      rule: violation.id,
      targets: violation.nodes.map((node) => node.target),
    }))
  ).toEqual([]);
};

test("スライド表示", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("group", { name: `1 / ${TOTAL}` })).toBeVisible();
  await scan(page);
});

test("一覧", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "一覧" }).click();
  await expect(page.getByRole("grid")).toBeVisible();
  await scan(page);
});

test("入力欄のあるスライド", async ({ page }) => {
  await page.goto("/#5");
  await expect(page.getByRole("textbox", { name: "メモ" })).toBeVisible();
  await scan(page);
});
