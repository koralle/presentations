# @koralle/deck

JSX で書いたスライドを PDF にする。中で [takumi-pdf](https://takumi.kane.tw/docs/pdf) を使う。ヘッドレスブラウザは起動しない。

ブラウザで見たいときは [`@koralle/preview`](../preview/README.md) を使う。同じ `slides` を Vite でライブプレビューする。

## 入口は 2 つある

| import 元 | 中身 | 使う場面 |
| --- | --- | --- |
| `@koralle/deck` | `Slide` / 色 / 寸法 / 型 | スライドを書く。ブラウザからも読める |
| `@koralle/deck/pdf` | `renderDeck` | PDF を作る。takumi-pdf（ネイティブ）に依存する |

`renderDeck` を `@koralle/deck` から出していないのは、`slides.tsx` が `@koralle/deck` を import するため。PDF 専用の依存を同じ入口に置くと、プレビュー（ブラウザ）がネイティブモジュールを解決しようとして落ちる。

## 使い方

デッキのパッケージ（`slides/*`）で、スライドを `Slide` で並べて `renderDeck` に渡す。

```tsx
// src/slides.tsx
import { Slide, SLIDE_THEME } from "@koralle/deck";

export const slides = [
  <Slide key="cover">
    <h1 style={{ fontSize: 64, margin: 0 }}>タイトル</h1>
    <p style={{ fontSize: 28, color: SLIDE_THEME.muted, margin: 0 }}>
      サブタイトル
    </p>
  </Slide>,
];
```

```ts
// src/pdf.tsx  （package.json の "pdf": "deck-pdf src/pdf.tsx" から呼ぶ）
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { renderDeck } from "@koralle/deck/pdf";

import { deck } from "./index";
import { slides } from "./slides";

const out = "dist/deck.pdf";
const pdf = await renderDeck({ deck, slides });
await mkdir(path.dirname(out), { recursive: true });
await writeFile(out, pdf);
```

`pnpm pdf`（ルート）か `pnpm --filter <deck> pdf` で `dist/` に PDF が出る。

## コードを載せる

`Code` に文字列を渡す。改行とインデントはそのまま残るので、テンプレートリテラルで書く。

```tsx
<Code lang="json" title=".mcp.json" fontSize={16}>
  {`{
  "mcpServers": {}
}`}
</Code>
```

`lang` を渡すと [Shiki](https://shiki.style/) で着色する。省略すれば素のテキスト。使える言語は `code.tsx` の `LANGS` にある 13 文法と、その別名:

| 文法 (id)                      | 別名                            |
| ------------------------------ | ------------------------------- |
| `html` / `css`                 |                                 |
| `javascript`                   | `js` / `cjs` / `mjs`            |
| `jsx`                          |                                 |
| `typescript`                   | `ts` / `cts` / `mts`            |
| `tsx`                          |                                 |
| `yaml`                         | `yml`                           |
| `json` / `toml` / `nix` / `go` |                                 |
| `rust`                         | `rs`                            |
| `shellscript`                  | `bash` / `sh` / `shell` / `zsh` |

増やすときは `shiki/langs/<id>.mjs` を import して `LANGS` に足す（`lang` の型も `Lang` に足す）。

長い行は折り返す。PDF では枠からはみ出した分が黙って切り捨てられるので、 `white-space: pre` は使わない。

着色は `codeToTokensBase()` のトークンを 1 つずつ `span` のインライン `color` にする。takumi はスタイルシートのクラスを解釈しないので `codeToHtml()` の HTML は使えない。

ハイライターは `createHighlighterCoreSync()` + JavaScript 正規表現エンジンで同期的に作る（WASM も非同期の初期化も無い。プレビューのブラウザでも同じコードが動く）。文法を `shiki/langs/*` から静的に読んでいるので、登録した文法だけがバンドルに入る。

言語を全言語（346）にすると初期化だけで 1.7 秒、プレビューのビルドが 9MB / 322 チャンクになる（PDF 生成 0.3 秒 → 2.8 秒）。必要になったら増やす方針で、いまは 13 文法。

文法が読めないときは `forgiving: true` で着色だけ諦める。

## API

| 名前 | 内容 |
| --- | --- |
| `renderDeck({ deck, slides, ... })` | `@koralle/deck/pdf` から。PDF のバイト列(`Uint8Array`)を返す |
| `Slide` | 1ページ分の枠。1要素 = 1ページ |
| `Code` | コード片。等幅 + 薄い背景の枠。`title`（見出し）/ `lang`（着色）/ `fontSize` を取る |
| `SLIDE_SIZE` | 1280x720px(16:9)。PDF では 960x540pt になる |
| `SLIDE_THEME` | 既定の色（`background` / `color` / `muted` / `codeBackground` / `codeBorder`） |
| `DEFAULT_FONT_FAMILY` | `'LINE Seed JP'` |
| `CODE_FONT_FAMILY` | `'UDEV Gothic', monospace`（`pre` / `code` / `kbd` / `samp`） |
| `DEFAULT_FONT_FACES` | 既定で登録するフェイス（`fonts/` のファイルとファミリー・太さ） |

`renderDeck` のオプションは `size` / `fonts` / `margin` / `lang`。`deck` は `title` / `author` / `date` を PDF のメタデータに使う。

## 実装上の注意

### PDF は Vite に変換させて Node で動かす

PDF を作るのは `deck-pdf`（このパッケージの `bin/pdf.mjs`）。デッキのスクリプトを Vite に変換させて Node で実行する。実行は `ModuleRunner`（`server.environments.ssr.runner.import()`）経由で、`ssrLoadModule()` は ModuleRunner に置き換わった非推奨 API なので使わない。

```json
"pdf": "deck-pdf src/pdf.tsx"
```

`tsx` を使わないのは、tsx が tsconfig を **1 つだけ**読み、その `include` に入っているファイルにしか `jsx` を当てないため。デッキ（cwd）の tsconfig を読ませると `packages/deck/src/*.tsx` が **classic 変換**になり `React is not defined` で落ちる。Vite はプレビューと同じ変換器なので、`--tsconfig` のような回避策なしで両方の `.tsx` を扱える。

`configFile: false` で起動している。デッキ側の `vite.config.ts` はプレビュー用（`root` を `preview/` に固定し Panda を挟む）で、PDF には要らない。

`index.tsx` と `code.tsx` が共有する色とフォントは `theme.ts` にある。

### 1ページ = 1スライド

`Slide` は `height: 100vh` と `breakAfter: "page"` で改ページする。

- `height: 100%` はページの高さを取れず、背景が途中で切れる
- `height: 720px` のような固定値は余白の分だけはみ出して空ページが増える
- `boxSizing: border-box` が無いと `padding` が高さに上乗せされてはみ出す

### フォント

takumi はシステムフォントを読まない。既定ではこのパッケージの `fonts/` に置いた LINE Seed JP（本文）と UDEV Gothic（コード）を読んで登録する。`LINESeedJP-Regular.ttf` が
本文、`LINESeedJP-Bold.ttf` が見出しと `<b>`/`<strong>`。ビルドにネットワークは要らない。

takumi の UA スタイルシートは `code` / `pre` に等幅を当てないので、`renderDeck` が `CODE_FONT_FAMILY` を `pre` / `code` / `kbd` / `samp` に当てる CSS を一緒に渡している。

プレビュー（ブラウザ）は同じファイルを `@koralle/deck/fonts.css` から `@font-face` で読む。
別のフォントにしたいときは `renderDeck` の `fonts` に渡す。

### JSX の `style` はオブジェクトで書く

```tsx
<div style={{ fontSize: 28 }}>OK</div>
<div style="font-size: 28px">NG: 文字列は無視される</div>
```

文字列で書いてもエラーにならず、単にスタイルが当たらない。`tw` 属性（Tailwind 風のユーティリティ）も使える。
