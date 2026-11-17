import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

import { TOTAL } from "./fixture/params";

const counter = (page: Page) => page.locator('p[aria-live="polite"]');

const expectCounter = async (page: Page, index: number) => {
  await expect(counter(page)).toHaveText(`スライド ${index} / ${TOTAL}`);
};

const expectAt = async (page: Page, index: number) => {
  await expectCounter(page, index);
  await expect
    .poll(async () => {
      const hash = await page.evaluate(() => window.location.hash);

      return hash;
    })
    .toBe(`#${index}`);
  await expect(
    page.getByRole("group", { name: `${index} / ${TOTAL}` })
  ).toBeVisible();
};

/**
 * 「位置が動いていないこと」の確認。
 *
 * `go()` / `step()` は `startTransition` の中で状態を変えるので、キーを押した直後に
 * 読むと古い値がまだ DOM に残っていて、間違って動いていても素通りする。
 * `expect` は最初のポーリングで一致すればそのまま通るので、待ち合わせにはならない。
 * （変異テストで実際に素通りしたので、ここで明示的に待つ。）
 * shortcut: commit が 300ms を超える環境では取りこぼして偽の緑になる。
 * 不安定になったらカウンタの 2 回読みが一致するまで待つ形にする。
 */
const expectStays = async (page: Page, index: number) => {
  await page.waitForTimeout(300);
  await expectCounter(page, index);
};

const heading = (page: Page, index: number) =>
  page.getByRole("heading", { name: `${index} 枚目` });

/**
 * アプリを開いて、キーリスナーが張られるまで待つ。
 *
 * - 同じドキュメント内の `#` 移動では React が再マウントされないので、ハッシュを
 *   変えて開き直すときは reload する
 * - `load` が返っても passive effect はまだ走っていないことがある。ここで使う
 *   `expect` が DOM を読む往復をはさむことで、リスナー（useEffect）が張られてから
 *   最初のキーを押すことになる（待たないと最初のキーが落ちて 1 回分ずれる）
 */
const open = async (page: Page, hash = "") => {
  await page.goto(`/${hash}`);
  await page.reload();
  await expect(counter(page)).toHaveText(/^スライド \d+ \/ \d+$/u);
};

test.beforeEach(async ({ page }) => {
  await open(page);
});

test("1 枚目から始まり、20 枚を読み込んでいる", async ({ page }) => {
  await expectAt(page, 1);
  await expect(heading(page, 1)).toBeVisible();
});

test("キーで前後に 1 枚ずつ動く", async ({ page }) => {
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("Space");
  await page.keyboard.press("l");
  await page.keyboard.press("j");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("PageDown");
  await expectAt(page, 7);

  await page.keyboard.press("ArrowLeft");
  await page.keyboard.press("h");
  await page.keyboard.press("k");
  await page.keyboard.press("ArrowUp");
  await page.keyboard.press("PageUp");
  await expectAt(page, 2);
});

test("gg で先頭、G で末尾、Home/End でも端に飛ぶ", async ({ page }) => {
  await page.keyboard.press("G");
  await expectAt(page, TOTAL);

  await page.keyboard.press("Home");
  await expectAt(page, 1);

  await page.keyboard.press("End");
  await expectAt(page, TOTAL);

  // `g` は 1 秒以内に 2 回（`GG_TIMEOUT_MS`）。間に assertion を挟むと、遅い環境で
  // その待ち時間が 1 秒を超えて `gg` が成立しなくなる。続けて押すこと。
  await page.keyboard.press("g");
  await page.keyboard.press("g");
  await expectAt(page, 1);

  // 1 文字目のあとに他のキーを挟むと gg は不成立。
  await page.keyboard.press("G");
  await page.keyboard.press("g");
  await page.keyboard.press("ArrowLeft");
  await page.keyboard.press("g");
  await expectAt(page, TOTAL - 1);
});

test("表示位置は URL のハッシュに残り、リロードでも戻らない", async ({
  page,
}) => {
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowRight");
  await expectAt(page, 3);

  await page.reload();
  await expectAt(page, 3);

  await open(page, "#7");
  await expectAt(page, 7);

  // 範囲外は端に丸める。
  await open(page, "#99");
  await expectAt(page, TOTAL);
});

test("O で一覧になり、サムネイルを選ぶとそのスライドが開く", async ({
  page,
}) => {
  await page.keyboard.press("O");

  const grid = page.getByRole("grid");
  await expect(grid).toBeVisible();
  await expect(grid.locator("[data-key]")).toHaveCount(TOTAL);

  await grid.locator('[data-key="4"]').click();

  await expect(grid).toBeHidden();
  await expectAt(page, 5);
  await expect(heading(page, 5)).toBeVisible();
});

test("一覧では Enter でフォーカス中のスライドを開く", async ({ page }) => {
  await page.keyboard.press("O");

  const grid = page.getByRole("grid");
  await expect(grid).toBeVisible();
  await grid.locator('[data-key="11"]').focus();
  await page.keyboard.press("Enter");

  await expect(grid).toBeHidden();
  await expectAt(page, 12);
});

test("一覧の矢印キーはフォーカスだけを動かし、スライドは動かさない", async ({
  page,
}) => {
  await page.keyboard.press("O");
  await expect(page.getByRole("grid")).toBeVisible();
  await expect(page.locator('[data-key="0"]')).toBeFocused();

  // 矢印は window のハンドラも見るが、一覧では枚数を動かさない。
  await page.keyboard.press("ArrowRight");
  await expect(page.locator('[data-key="1"]')).toBeFocused();
  await expectStays(page, 1);

  // `End` は GridList が末尾の項目にフォーカスを移す。window のハンドラが一緒に
  // `go()` を呼ぶと選択まで飛んでしまい、矢印キーと振る舞いが食い違う。
  await page.keyboard.press("End");
  await expect(page.locator(`[data-key="${TOTAL - 1}"]`)).toBeFocused();
  await expectStays(page, 1);
});

test("一覧では G で末尾に飛び、フォーカスも付いていく", async ({ page }) => {
  await page.keyboard.press("O");
  await expect(page.getByRole("grid")).toBeVisible();

  await page.keyboard.press("G");

  await expect(page.locator(`[data-key="${TOTAL - 1}"]`)).toBeFocused();
  await expectCounter(page, TOTAL);
});

test("端でボタンが無効になってもフォーカスは body に落ちない", async ({
  page,
}) => {
  const prev = page.getByRole("button", { name: "前のスライド" });
  const next = page.getByRole("button", { name: "次のスライド" });

  await expect(prev).toBeDisabled();
  await expect(next).toBeEnabled();

  // 2 枚目から「前へ」を押すと 1 枚目になり、押したボタン自身が無効になる。
  await page.keyboard.press("ArrowRight");
  await expect(prev).toBeEnabled();
  await prev.click();

  await expectAt(page, 1);
  await expect(prev).toBeDisabled();
  await expect(next).toBeFocused();
});

test("スライドの左右のボタンでも前後に動く", async ({ page }) => {
  const prev = page.getByRole("button", { name: "前へ" });
  const next = page.getByRole("button", { name: "次へ" });

  await expect(prev).toBeDisabled();

  await next.click();
  await expectAt(page, 2);

  // 押した結果無効になる側（2 枚目で「前へ」）は、フォーカスが body に落ちない。
  await prev.click();
  await expectAt(page, 1);
  await expect(prev).toBeDisabled();
  await expect(next).toBeFocused();
});

test("スライドが小さいときは重ねたボタンを出さない", async ({ page }) => {
  const prev = page.getByRole("button", { name: "前へ" });
  const next = page.getByRole("button", { name: "次へ" });

  await expect(prev).toBeVisible();

  // 390px では倍率が 0.5 を下回るので、ボタンがスライドの内側の余白に
  // 収まらず本文に被る。ツールバーのボタンだけが残る。
  await page.setViewportSize({ width: 390, height: 700 });
  await expect(prev).toBeHidden();
  await expect(next).toBeHidden();
  await expect(
    page.getByRole("button", { name: "次のスライド" })
  ).toBeVisible();
});

test("狭い画面ではサムネイルが列幅に縮み、一覧が横にはみ出さない", async ({
  page,
}) => {
  // 320px は等倍 1280px の 0.25（= 320px）が列に収まらない幅。
  await page.setViewportSize({ width: 320, height: 700 });
  await page.keyboard.press("o");

  const grid = page.getByRole("grid");
  await expect(grid).toBeVisible();

  const item = grid.locator("[data-key]").first();

  const itemWidth = async () => {
    const box = await item.boundingBox();

    return box?.width ?? 0;
  };

  // 倍率を測り直すまで待つ（縮むまではカードが列からはみ出す）。
  await expect.poll(itemWidth).toBeLessThan(320);

  expect(
    await grid.evaluate((el) => el.scrollWidth - el.clientWidth)
  ).toBeLessThanOrEqual(0);
});

test("スライドは 720px の等倍で組んで縮小する", async ({ page }) => {
  const stage = page.getByRole("group", { name: `1 / ${TOTAL}` });

  // `Slide` の `height: 100vh` を `viewer.css` の `@scope` が上書きできているか。
  // ビューポートは 900px にしてあるので、720 なら上書きが効いている。
  await expect(stage.locator("section")).toHaveJSProperty("offsetHeight", 720);

  // 倍率が 0 のまま（ResizeObserver が張れていない）だと大きさが出ない。
  const box = await stage.boundingBox();
  expect(box).not.toBeNull();
  expect(box?.width).toBeGreaterThan(720);
  expect(box?.width).toBeLessThanOrEqual(1280);
  expect(box?.height).toBeLessThanOrEqual(900);
  expect((box?.width ?? 0) / (box?.height ?? 1)).toBeCloseTo(16 / 9, 1);

  // 一覧に切り替えるとアプリ側の viewport が作り直される。ref コールバックで
  // observe していないと、外れた要素を測り続けて倍率が 0 のまま戻る。
  await page.getByRole("button", { name: "一覧" }).click();
  await expect(page.getByRole("grid")).toBeVisible();
  await page.locator('[data-key="4"]').click();

  // 幅 0（倍率 0）だと toBeVisible が通らないので、これが待ち合わせになる。
  await expect(page.getByRole("group", { name: `5 / ${TOTAL}` })).toBeVisible();

  const back = await page
    .getByRole("group", { name: `5 / ${TOTAL}` })
    .boundingBox();

  expect(back?.width ?? 0).toBeGreaterThan(720);
});

test("入力欄の中ではキーを横取りしない", async ({ page }) => {
  await open(page, "#5");
  await expectAt(page, 5);

  const input = page.getByRole("textbox", { name: "メモ" });
  await input.click();
  await page.keyboard.type("jjlG");

  await expect(input).toHaveValue("jjlG");
  await expectStays(page, 5);
});
