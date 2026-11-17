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
// src/pdf.tsx  （package.json の "pdf": "tsx --tsconfig ../../tsconfig.tsx.jsonc src/pdf.tsx" から呼ぶ）
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
<Code title=".mcp.json" fontSize={16}>
  {`{
  "mcpServers": {}
}`}
</Code>
```

長い行は折り返す。PDF では枠からはみ出した分が黙って切り捨てられるので、 `white-space: pre` は使わない。**構文ハイライトはしない**（色を付けたくなったら shiki などで着色した `span` を `Code` の children に渡す）。

## API

| 名前 | 内容 |
| --- | --- |
| `renderDeck({ deck, slides, ... })` | `@koralle/deck/pdf` から。PDF のバイト列(`Uint8Array`)を返す |
| `Slide` | 1ページ分の枠。1要素 = 1ページ |
| `Code` | コード片。等幅 + 薄い背景の枠。`title`（見出し）と `fontSize` を取る |
| `SLIDE_SIZE` | 1280x720px(16:9)。PDF では 960x540pt になる |
| `SLIDE_THEME` | 既定の色（`background` / `color` / `muted` / `codeBackground` / `codeBorder`） |
| `DEFAULT_FONT_FAMILY` | `'LINE Seed JP'` |
| `CODE_FONT_FAMILY` | `'UDEV Gothic', monospace`（`pre` / `code` / `kbd` / `samp`） |
| `DEFAULT_FONT_FACES` | 既定で登録するフェイス（`fonts/` のファイルとファミリー・太さ） |

`renderDeck` のオプションは `size` / `fonts` / `margin` / `lang`。`deck` は `title` / `author` / `date` を PDF のメタデータに使う。

## 実装上の注意

### JSX を変換させるには `--tsconfig` が要る

このパッケージのソース（`index.tsx` / `code.tsx`）はふつうに JSX で書いてある。ただし `tsx` は tsconfig を **1 つだけ**読み、しかもその `include` に入っているファイルにしか `jsx` を当てない。デッキ側の tsconfig を cwd から読ませると、`packages/*/src` の `.tsx` は **classic 変換**になり `React is not defined` で落ちる。

そのため PDF を作るスクリプトはリポジトリ直下の `tsconfig.tsx.jsonc`（全ソースを含む）を渡している。

```json
"pdf": "tsx --tsconfig ../../tsconfig.tsx.jsonc src/pdf.tsx"
```

新しいデッキを足すときもこの形にする。型チェック（`tsrs`）は各パッケージの `tsconfig.json` が見るので、`tsconfig.tsx.jsonc` は変換のためだけの設定。

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
