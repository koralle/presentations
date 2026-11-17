import { defineConfig } from "@playwright/test";

const PORT = 5273;

// GitHub Actions は CI=true を立てる。
const CI = process.env["CI"] === "true";

export default defineConfig({
  testDir: "e2e",
  // `.only` を残したまま CI が緑になるのを防ぐ。失敗は 1 回だけ引き直し、
  // 引き直した回のトレースを HTML レポートに残す（読めない失敗を作らない）。
  forbidOnly: CI,
  retries: CI ? 1 : 0,
  reporter: CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    trace: "on-first-retry",
    baseURL: `http://localhost:${PORT}`,
    // 高さを 720px から変えておく。`Slide` の `height: 100vh` を上書きできて
    // いなければ、スライドの高さが 720 ではなくビューポートの高さになる。
    viewport: { width: 1280, height: 900 },
  },
  // `--strictPort` で、既に居るサーバーに繋がずポート衝突で落とす。既存のサーバーを
  // 使い回すと、別の作業ツリーのコードをテストして緑になることがある（このリポジトリ
  // は作業ツリーを並べて使う）。
  webServer: {
    command: `pnpm exec vite --config e2e/fixture/vite.config.ts --port ${PORT} --strictPort`,
    reuseExistingServer: false,
    url: `http://localhost:${PORT}`,
  },
});
