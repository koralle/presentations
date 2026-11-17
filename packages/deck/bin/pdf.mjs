#!/usr/bin/env node
import { createServer, isRunnableDevEnvironment } from "vite";

/**
 * デッキのスクリプト（例: `src/pdf.tsx`）を Vite に変換させて Node で実行する。
 * 使い方は `deck-pdf src/pdf.tsx`。
 *
 * `tsx` ではなく Vite を通すのは、スライドのパッケージ（`packages/deck`）の .tsx も
 * JSX 変換したいから。tsx は tsconfig を 1 つだけ読み、その `include` に入っている
 * ファイルにしか `jsx` を当てないので、`packages/<pkg>/src` が classic 変換になり
 * `React is not defined` で落ちる（全ソースを含む `--tsconfig` を渡す回避策が要る）。
 * Vite はプレビューと同じ変換器なので、その設定なしで両方の .tsx を扱える。
 *
 * 実行は `ModuleRunner`（`server.environments.ssr.runner`）経由。`ssrLoadModule()`
 * は ModuleRunner に置き換えられた非推奨 API なので使わない。
 *
 * `configFile: false` にしているのは、デッキ側の `vite.config.ts` がプレビュー用
 * （`root` を `preview/` に固定し Panda を挟む）で、PDF には要らないため。
 */
const [entry] = process.argv.slice(2);

if (entry === undefined) {
  console.error("使い方: deck-pdf <エントリ>");
  process.exit(1);
}

const server = await createServer({
  appType: "custom",
  configFile: false,
  logLevel: "warn",
  root: process.cwd(),
  server: { middlewareMode: true },
});

const environment = server.environments.ssr;

if (!isRunnableDevEnvironment(environment)) {
  throw new Error("ssr 環境が runnable ではない（同じプロセスで実行できない）");
}

try {
  // Vite のモジュール URL はルートからの絶対パス。`./src/pdf.tsx` も受ける。
  await environment.runner.import(`/${entry.replace(/^\.?\//u, "")}`);
} finally {
  await server.close();
}
