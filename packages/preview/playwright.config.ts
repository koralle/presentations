import { defineConfig } from "@playwright/test";

const PORT = 5273;

export default defineConfig({
  testDir: "e2e",
  use: {
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
