import path from "node:path";

import { pandacss } from "@pandacss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import type { UserConfig } from "vite";

/**
 * デッキのパッケージ（`slides/*`）の `vite.config.ts` から呼ぶ。
 *
 * ```ts
 * import { deckPreviewConfig } from "@koralle/preview/vite";
 *
 * export default deckPreviewConfig(import.meta.dirname);
 * ```
 *
 * root をデッキ側の `preview/` に固定するので、どの cwd から起動しても同じ結果になる。
 * 設定を各デッキに書き写さないための入口。
 */
export const deckPreviewConfig = (deckRoot: string): UserConfig =>
  defineConfig({
    root: path.join(deckRoot, "preview"),
    // Panda は react より前に置く（styled-system の生成と CSS の注入を受け持つ）。
    // `transform: true` で静的な `css()` 呼び出しをビルド時にクラス文字列へ置き換え、
    // ランタイムを同梱しない。
    //
    // kiso.css（リセット）は `viewer.css` で `layer(reset)` として読む。Panda の
    // ユーティリティは `@layer utilities` なので、レイヤーの外にある `:where()`
    // のリセットより後に適用される。
    //
    // `cwd` をこのパッケージに固定する（既定は Vite の root で、デッキ側の
    // `preview/` になる）。`panda.config.ts` と `styled-system` をそこから探すので、
    // ここを間違えると CSS が 1 行も出ないままクラス名だけが付く。
    plugins: [
      pandacss({ cwd: path.join(import.meta.dirname, ".."), transform: true }),
      react(),
    ],
    resolve: {
      // デッキとこのパッケージの両方が react を宣言しているので、解決先を
      // デッキ側の 1 つに寄せる。2 つ読むとスライド内の hooks が壊れる。
      dedupe: ["react", "react-dom"],
    },
  });
