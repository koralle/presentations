# @koralle/preview

`@koralle/deck` で書いたスライドを、PDF に焼く前にブラウザで見るための Vite アプリ。編集すると HMR でその場に反映される。

## 使い方

デッキのパッケージ（`slides/*`）に `preview/` を置く。ルートからは `pnpm preview`、単体は `pnpm --filter <deck> preview`。

```text
slides/<deck>/
├── preview/
│   ├── index.html   # #root と <script type="module" src="/main.tsx">
│   └── main.tsx     # deck と slides を DeckViewer に渡すだけ
├── vite.config.ts   # deckPreviewConfig(import.meta.dirname) の 2 行
└── src/
    ├── index.ts     # deck（タイトルなどのメタデータ）
    └── slides.tsx   # Slide を並べた配列
```

```tsx
// preview/main.tsx
import { DeckViewer } from "@koralle/preview";
import { createRoot } from "react-dom/client";

import { deck } from "../src/index";
import { slides } from "../src/slides";

const container = document.querySelector("#root");
if (container === null) {
  throw new Error("preview/index.html に #root が無い");
}

createRoot(container).render(<DeckViewer deck={deck} slides={slides} />);
```

```json
// slides/<deck>/package.json
{
  "scripts": {
    "preview": "vite"
  },
  "devDependencies": {
    "@koralle/preview": "workspace:*",
    "react-dom": "catalog:react",
    "vite": "catalog:tooling"
  }
}
```

```ts
// slides/<deck>/vite.config.ts
import { deckPreviewConfig } from "@koralle/preview/vite";

// root はこのパッケージの preview/ に固定される（cwd に依存しない）。
export default deckPreviewConfig(import.meta.dirname);
```

設定の中身（`root` / `plugins` / `resolve.dedupe`）は `@koralle/preview/vite` が持つので、デッキ側は 2 行だけ置く。`root` をデッキ側で決めるため、どの cwd から起動しても同じ結果になる。

## 操作

| キー               | 動作                                       |
| ------------------ | ------------------------------------------ |
| `→` `Space` `l`    | 次のスライド                               |
| `←` `h`            | 前のスライド                               |
| `↓` `PageDown` `j` | 次のスライド                               |
| `↑` `PageUp` `k`   | 前のスライド                               |
| `gg`               | 最初のスライド                             |
| `G`                | 最後のスライド                             |
| `Home` / `End`     | 最初 / 最後                                |
| `O`                | 一覧（サムネイル）とスライド表示の切り替え |
| `F`                | 全画面                                     |

`hjkl` は Vim 風。大文字でも同じ。

一覧では `GridList`（React Aria）がキーボードを受け持つ。矢印キーで 2 次元に動き、 `Home` / `End` と数字キー（先頭一致の項目へ）も使える。`Enter` / `Space` / クリックで
そのスライドを開く。`hjkl` が効くのはスライド表示だけ。

`gg` は 1 秒以内に 2 回押す。他のキーを押すと 1 文字目は取り消される。一覧の切り替えは `O`（`G` を最後のスライドに使うため、`G` から移した）。

ボタンにフォーカスがあるときの `Space` はボタンの操作になる（スライドは動かない）。
入力欄の中ではキーを横取りしない。

マウスなら、スライドの左右に重ねた円い前後ボタンでも動かせる（カルーセル風）。
キーボードと読み上げにはツールバーの `前のスライド` / `次のスライド` があるので、
重ねたほうの名前は `前へ` / `次へ` にして 2 組を区別している。一覧では重ねた
ボタンは出ない（ツールバーのものを使う）。スライドが小さいとき（倍率 0.5 未満。
内側の余白にボタンが収まらず本文に被る）も出さない。どちらも機能はツールバー側に
残っている。

表示中のページ番号は URL の `#<n>` に残る。HMR やリロードで先頭に戻らない。

## ファイル構成

| ファイル | 責務 |
| --- | --- |
| `src/components/deck-viewer.tsx` | 組み立て。状態と部品を繋ぐだけで、表示の分岐だけを持つ |
| `src/components/viewer-toolbar.tsx` | タイトル・ページ送り・一覧/全画面（`Button` / `ToggleButton`） |
| `src/components/slide-stage.tsx` | 等倍ステージ（`StageFrame`）と倍率計測、切り替えの View Transition |
| `src/components/slide-grid.tsx` | 一覧（`GridList`） |
| `src/hooks/use-slide-navigation.ts` | 表示位置と一覧かどうか、URL のミラー、切り替え（`go` / `step`） |
| `src/hooks/use-keyboard-shortcuts.ts` | キーボード操作（矢印・`hjkl`・`gg`・`O`・`F`） |
| `src/hooks/use-fullscreen.ts` | 全画面の状態と `fullscreenchange` の購読 |
| `src/components/viewer.css` | Panda で書けないものだけ（リセット・`body`・`::view-transition-*`） |
| `src/vite.ts` | `deckPreviewConfig`（デッキ側の `vite.config.ts` から呼ぶ） |
| `e2e/fixture/` | E2E の題材。20 枚のスライドを持つ最小のデッキ（`deckPreviewConfig` 経由で起動する） |
| `e2e/preview.spec.ts` | E2E。位置・キー・URL・一覧・フォーカス・ステージの寸法 |
| `e2e/a11y.spec.ts` | E2E。axe で WCAG A・AA の自動検出できる違反をスキャン |
| `playwright.config.ts` | E2E の設定（`webServer` でフィクスチャの Vite を立てる） |

## テスト

```sh
pnpm test:e2e                                  # ルートから
pnpm --filter @koralle/preview test:e2e        # このパッケージだけ
```

題材は `e2e/fixture/` の 20 枚。本物のデッキと同じく `deckPreviewConfig` から Vite を起動するので、配線（root・plugins・dedupe）が壊れてもここで落ちる。枚数は 20 にしてある（先頭・末尾・途中と一覧の折り返しを全部踏める）。

見ているもの: 表示位置とカウンタ、キー（矢印・`hjkl`・`gg`・`G`・`Home`/`End`）、 URL のハッシュとリロード、一覧の切り替えとサムネイル選択・`Enter`、端での
ボタンの無効化とフォーカス、一覧での矢印キーがフォーカスだけを動かすこと、
一覧の `G` でフォーカスも末尾に付いていくこと、スライドが 720px の等倍で組まれて
縮小されること（一覧から戻ったときの測り直しを含む）、入力欄の中でキーを横取り
しないこと。

`e2e/fixture/params.ts` の `TOTAL` をフィクスチャと spec の両方が見る。片方だけ
変えると、落ちる場所と原因が離れてしまう。

見ていないもの: 見た目（View Transition のアニメーション、フォント、改行位置）。
これらはブラウザの描画結果で、`pnpm pdf` の PDF で確認する。全画面はテスト用の
ブラウザで再現できないので、手で見る。

`e2e/a11y.spec.ts` は `@axe-core/playwright` で、スライド表示・一覧・入力欄のある
スライドの 3 つの状態をスキャンする。タグは `wcag2a` / `wcag2aa` / `wcag21a` / `wcag21aa` / `wcag22aa` だけにしてある（best-practice のルールまで入れると、
デッキの中身＝利用者のスライドへの指摘が混ざる）。axe が見られるのは一部だけ
なので、これは手で確かめないための代わりにはならない。

一覧のサムネイルは、当初 `aria-hidden="true"` で包んでいたが、スライドにリンクや
入力欄があると「aria-hidden の中にフォーカス可能な要素がある」で落ちた。`inert` に変えてある（フォーカスも読み上げも外れ、見た目は変わらない）。ページ番号
（`.number`）は、重ねるとスライドの中身を隠すのでサムネイルの下に置いてある
（カードの地の上なので `muted` でも 7:1 ある）。

初回だけ `pnpm exec playwright install chromium` が要る。

## 実装上の注意

### UI は React Aria

ツールバーは `Button` / `ToggleButton`、一覧は `GridList`（`layout="grid"` + `selectionMode="single"`）。一覧の矢印移動、フォーカスの roving tabindex、
選択状態（`aria-selected`）、フォーカスした項目のスクロールは React Aria が持つ。
列数から 1 行ぶんを自前で計算したり `scrollIntoView` したりしない。

- `Toolbar` は使っていない。矢印キーでフォーカスを動かすので、スライド送りの
  ショートカットと取り合いになる
- `onAction` はクリックでも Enter でも来なかったので、開く操作は `onSelectionChange`（クリック・`Space`・選択の解除）と、Enter の自前処理で拾う
- 一覧を開いたときのフォーカスは `autoFocus`。`gg` / `G` で選択が飛んだときは `go()` の中で合わせる（矢印キーはフォーカスだけを動かし、選択は動かさない）
- キーのハンドラは `event.defaultPrevented` を見て降りる。加えて、一覧では `Home` / `End` を `isGridKey` で明示的に手放している。`defaultPrevented` だけでは
  降りきらず、スライド（選択）まで動いて矢印キーと振る舞いが食い違っていた

アイコンは `lucide-react`。前後の矢印は `ArrowLeft` / `ArrowRight` で、ボタンは `display: flex` + `align-items` / `justify-content` で中央に置く（文字のままだと
フォントのメトリクスでずれ、`placeItems` ではグリッド項目が伸びて左寄せになる）。

### スタイルは Panda CSS（`viewer.css` は残りもの）

部品のスタイルは各コンポーネントで `css()` を呼んでクラス名を受け取り、 `className` に渡す。色などのトークンは `panda.config.ts` の `theme.tokens`。

- **`styled-system/` は生成物**。`typecheck` が `panda codegen` を先に走らせ、 Vite のプラグインも同じものを生成する（gitignore 済み）。`prepare` もあるが、
  インストールが no-op のときは走らないので、型検査は自前で生成する
- **`pandacss()` には `cwd` を渡す**。既定は Vite の root で、それはデッキ側の `preview/` になる。`panda.config.ts` が見つからないと CSS が 1 行も出ないまま
  クラス名だけが付く（見た目が全部抜ける）
- **数値は px で書く**。`padding: 8` は spacing トークンの 8（= 2rem）になる
- **React Aria の `data-*` をそのまま選べる**。`"&[data-selected]": {...}` のように
  属性セレクタが書けるので、`className` に render props を渡す必要は無い
  （`slide-grid.tsx`）
- **`css()` の中から他のパッケージの値を参照しない**。`SLIDE_SIZE` は CSS 変数と
  して渡している（`slide-stage.tsx` の `stageVars`）

`viewer.css` に残るのは、要素セレクタ（リセットと `body`）と擬似要素
（`::view-transition-*`）だけ。セレクタは全部 `:where()` で包んで詳細度 0 に
してある（Panda が吐く 1 クラス指定に負ける）。

### リセットは kiso.css

`viewer.css` の先頭で `@import "kiso.css" layer(reset)`。Panda のユーティリティは `@layer utilities` に入るので、kiso をレイヤーの外に置くと（レイヤーの外のほうが
強い）部品の指定がリセットに負ける。レイヤーに載せて譲る。レイヤーの順序は `viewer.css` の先頭の `@layer reset, base, tokens, recipes, utilities;` で決める。

ただし和文向けに `line-break: strict` / `text-spacing-trim: trim-start` / `overflow-wrap: anywhere` を `:root` に置くので、スライド（`.stage`）では既定値に
戻している。takumi-pdf はこれらを見ないため、そのままだとプレビューだけ改行位置が
ずれる（このパッケージが避けたいこと）。

### 等倍で組んで縮小する

スライドは 1280x720 の等倍で組んでから `transform: scale()` で縮小する。文字サイズを画面幅に合わせて伸縮させると PDF と行長が変わり、改行位置がずれて「プレビューでは収まるのに PDF でははみ出す」になるため。倍率は `ResizeObserver` で枠の大きさから測る。

一覧のサムネイルも同じで、倍率は 1 枚目のカードの `contentRect` から測る。列の幅は
ブラウザに決めさせている（`auto-fit` + `minmax(min(100%, 320px), 336px)`）ので、
決まった結果を読んで倍率に戻す。`transform: scale()` は無次元の数値しか取れず、 `calc(100cqw / 1280)` は長さになってしまうため CSS だけでは倍率を作れない。
観測するのはカード（列が幅を決める）で、枠ではない。枠の幅は倍率に依存するので、
測って倍率に入れると振動する。

### `Slide` の `height: 100vh` を上書きしている

`Slide` は PDF の改ページに `height: 100vh` を使う。ブラウザではビューポートの高さになってしまい 720px の枠からはみ出すので、スライドの枠（`.stage`）の `css()` に `"& > section": { height: "100% !" }` を置いて枠に固定する。 `packages/deck` 側は PDF の都合を優先して変えない。

この上書きはスライドの直下が `<section>`（= `Slide`）である前提。`Slide` を独自の要素で包むと効かなくなる。

### 読み上げとフォーカス

- `<main>` はスライド表示でも一覧でも同じ 1 つを通す。切り替えでランドマークが
  消えると、ランドマークで移動する読み上げが行き先を失う
- スライドは `role="group"` + `aria-roledescription="スライド"` + `aria-label="2 / 5"` で包む。中身を読み始めたときに何枚目か分かる
- ページ番号（`.counter`）は `aria-live="polite"` のまま、`aria-atomic` と
  読み上げ専用の「スライド」を付けて `スライド 2 / 5` と読ませる
- 端で「前へ / 次へ」が無効になるとブラウザはフォーカスを `body` に落とす。
  押した結果が無効化だったときは反対側のボタンへ移す
- `aria-keyshortcuts` は React Aria の DOM props フィルタが落とすので、書いても
  効かない。`O` / `F` は視覚ヒント（`aria-hidden`）だけで伝える
- 一覧のサムネイルは `inert` で包む（`aria-hidden` ではない）。スライドに
  フォーカス可能な要素（リンク・入力欄）があると、`aria-hidden` の中に
  フォーカスできる要素が残って WCAG 4.1.2 に触れる。`inert` なら両方外れる

### react を 1 つに寄せる

デッキと `@koralle/preview` の両方が `react` を宣言しているので、`vite.config.ts` の `resolve.dedupe` で解決先をデッキ側に寄せている。2 つ読み込まれると、スライドの中で hooks を使ったときに壊れる。`react-dom` はデッキ側の宣言を使う（`@koralle/preview` は import しない）。

devDependencies の `react-dom` / `@types/react-dom` は E2E のフィクスチャ（デッキと
同じ形をしている）のためだけにある。消すとテストが起動しない。

### 切り替えは View Transition

スライドの切り替えは React の `<ViewTransition>` で、進むと左へ、戻ると右へ流す。
型（`forward` / `back`）は `startTransition` の中の `addTransitionType` で渡し、
クラス名は `viewer.css` 側に置いてある。`prefers-reduced-motion: reduce` では止まる。

倍率を測る `ResizeObserver` は ref コールバックで張る。一覧に切り替えると `viewport` が作り直されるので、effect で 1 度だけ observe すると外れた要素を測り続けて倍率が 0 になる。

### ブラウザでは再現できないもの

プレビューはブラウザで描くので、takumi-pdf と完全には一致しない。

| 項目 | 挙動 |
| --- | --- |
| `tw` 属性（takumi の Tailwind 風ユーティリティ） | ブラウザは解釈しないので効かない |
| フォント | `@koralle/deck/fonts.css` が PDF と同じファイル（`packages/deck/fonts`）を `@font-face` で読む。デッキの `index.html` にフォントの `link` は要らない |
| ページ分割 | `Slide` の中身が 720px を超えても改ページされない（PDF も同じで、はみ出した分はページ外に出る） |

最終確認は `pnpm pdf` で出した PDF で行う。プレビューは「速く見る」ためのもの。
