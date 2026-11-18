# @koralle/forge

ワークスペース全体のツールチェイン設定を置く場所。設定の意図はここに書き、設定ファイル自体はコメントを持たない（strict な JSON パーサに通すため）。

| 設定 | 入口 | 使う側 |
| --- | --- | --- |
| tsconfig | `@koralle/forge/tsconfig/base.json` | 各パッケージの `tsconfig.json` が `extends` |
| tsconfig (React/JSX) | `@koralle/forge/tsconfig/react.json` | JSX を書くパッケージが `extends` |
| Oxlint | `@koralle/forge/oxlint` の `createOxlintConfig` | ルートの `oxlint.config.ts` |
| Oxfmt | `@koralle/forge/oxfmt` の `oxfmtConfig` | ルートの `oxfmt.config.ts` |

`@koralle/forge` は使うパッケージの `devDependencies` に `workspace:*` で入れる。pnpm は依存していないパッケージを見せないので、入れ忘れると extends も import も解決できない。

## tsconfig/base.json

`@tsconfig/strictest` を土台にする。strictest が有効にするもの:

- `strict` / `noUncheckedIndexedAccess` / `exactOptionalPropertyTypes`
- `noImplicitReturns` / `noImplicitOverride` / `noFallthroughCasesInSwitch`
- `noPropertyAccessFromIndexSignature` / `noUnusedLocals` / `noUnusedParameters`
- `isolatedModules` / `skipLibCheck` / `esModuleInterop`

strictest に無いものとして、次を足している。

| オプション | 理由 |
| --- | --- |
| `target` / `lib` = `es2024` | 実行環境は Node 24。Cloudflare Workers に合わせる必要がないので最新の lib を使う |
| `module` = `preserve` / `moduleResolution` = `bundler` | ソースはバンドラが消費し、`noEmit` で型だけ見る。`NodeNext` の拡張子必須ルールを持ち込まない |
| `moduleDetection` = `force` | 拡張子の無いファイルもモジュール扱いにして、グローバル汚染を防ぐ |
| `resolveJsonModule` | 発表資料のメタデータを JSON で持つ想定（strictest には入っていない） |
| `verbatimModuleSyntax` | 型だけの import を `import type` で強制する。`isolatedModules` と併せて、バンドラが import を消す前提のコードを型で禁止する |
| `noEmit` | 型チェック専用。ビルドは各パッケージのバンドラが持つ |

参照元の turf-notes は、エディタの TS サーバーが workspace パッケージ経由の `extends` を解決できず node10 の解決に落ちるとして、各パッケージに `module` / `moduleResolution` を書き直している。**このリポジトリではその重複を置いていない。** TypeScript 7 は `moduleResolution: node10` 自体を廃止しており（`TS5108: Option 'moduleResolution=node10' has been removed`）、落ちる先が無い。実際にエディタの TS サーバーで確認した範囲では、`base.json` の `verbatimModuleSyntax`（型のみ import の検出）も `moduleResolution: bundler`（`exports` だけを持つパッケージの解決）も効いている。

## tsconfig/react.json

`base.json` に JSX 用の設定を足す。

| オプション | 理由 |
| --- | --- |
| `jsx` = `react-jsx` / `jsxImportSource` = `react` | 自動ランタイム。`jsxImportSource` は省略しても変換結果は同じだが、**knip がこの値を見て `react` を依存として数える**ので明示する（無いと `react` / `@types/react` が未使用と報告される） |
| `lib` に `dom` | `@types/react` が DOM の型を参照するため |

`tsx` は tsconfig の `jsx` を **cwd 基準**で解決する。デッキ（cwd）から別パッケージの `.tsx` を `exports` 経由で読むと classic 変換に落ちて `React is not defined` になるので、共有パッケージ側は JSX を使わない（`packages/deck` がその例）。

## `types` は自動で入らない

`tsrs` は `node_modules/@types` を自動では読まない。Node の API を使うパッケージは `@types/node` を入れたうえで `"types": ["node"]` を明示する（`slides/*` の `src/pdf.ts` が該当）。

## 型チェック

型チェッカは `tsrs`（TypeScript 7 の Rust 移植）。`pnpm typecheck` がルートの設定を見てから、`pnpm -r run typecheck` で各パッケージの `typecheck` を叩く。

このパッケージ自身は `src/*.ts` を持つので `tsconfig.json` と `"typecheck": "tsrs"` を置いている。TypeScript のソースを持たないパッケージに同じスクリプトを置くと、`tsrs` は tsconfig が無い場合に usage を出して 0 で終わるため**偽の成功**になる。ソースを足すときに両方足すこと。

## Oxlint

`ultracite/oxlint/core` を `extends` するだけの薄い層で、`createOxlintConfig()` が共通の `ignorePatterns` を必ず連結する。

Oxlint は `extends` した設定の `ignorePatterns` を継承しないため、この連結を各パッケージで書き直すと漏れる。パッケージ固有の ignore は引数で足す:

```ts
export default createOxlintConfig({ ignorePatterns: ["scripts/**"] });
```

共通の ignore は `.agents/`（APM が配置するスキル）と `apm_modules/`（その取得キャッシュ）。どちらもこのリポジトリのソースではない。

パッケージ固有のプリセットは `extends` で足す。forge の設定の**後ろ**に連結される:

```ts
// packages/preview/oxlint.config.ts
import { createOxlintConfig } from "@koralle/forge/oxlint";
import playwright from "ultracite/oxlint/playwright";
import react from "ultracite/oxlint/react";

export default createOxlintConfig({ extends: [react, playwright] });
```

`ultracite` を直接 import するパッケージは、自分の `devDependencies` にも `ultracite` を入れる（pnpm は依存していないパッケージを見せない）。

`core` に含まれない `react` / `playwright` / `tanstack` などのプリセットは、使うパッケージの設定でだけ有効にする。`packages/deck` は JSX を使わず `createElement` で組むので `react` を入れていない。

## Oxfmt

`ultracite/oxfmt` に、このリポジトリ固有の ignore（`.agents/` / `apm_modules/` / `.pi/`）を足す。`.pi/` はエージェントの実行時状態で、整形対象ではない。

`apm.lock.yaml` はルートの `oxfmt.config.ts` で ignore している（APM が生成するので手で整形しない）。

## knip

knip の設定はリポジトリ固有（workspaces の entry や ignoreDependencies）なので forge ではなくルートの `knip.config.ts` に置く。`typescript: true` を明示しているのは、knip の TypeScript プラグインが `typescript` 依存の有無で有効になる一方、このリポジトリは `tsrs` を使うため自動では有効にならないから。
