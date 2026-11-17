import type { ReactNode } from "react";

import { CODE_FONT_FAMILY_NAME, SLIDE_THEME } from "./theme";

/**
 * このファイルはブラウザからも読める（プレビューが `slides.tsx` 経由で読む）。
 * takumi-pdf に依存する `renderDeck` は `@koralle/deck/pdf` に分けてある。
 *
 * JSX で書いてよいが、PDF を作る `tsx` はリポジトリ直下の `tsconfig.tsx.jsonc` を
 * `--tsconfig` で渡す必要がある（このパッケージの .tsx も変換対象にするため）。
 */

/** スライド1枚のサイズ（CSS px）。16:9 で、PDF では 960x540pt(96dpi) になる。 */
export const SLIDE_SIZE = { width: 1280, height: 720 } as const;

/** フォントのファミリー名。CSS の `font-family` と takumi の登録名で共通。 */
export const FONT_FAMILY_NAME = "LINE Seed JP";

/** 既定のフォント。実ファイルは `packages/deck/fonts` に置いてある。 */
export const DEFAULT_FONT_FAMILY = `'${FONT_FAMILY_NAME}'`;

/**
 * 既定で登録するフェイス。本文が LINE Seed JP、コードが UDEV Gothic。
 * takumi はシステムフォントを読まないので、登録しないと日本語が描けない。
 * プレビューは同じファイルを `@koralle/deck/fonts.css` から読む。
 */
export const DEFAULT_FONT_FACES = [
  { family: FONT_FAMILY_NAME, file: "LINESeedJP-Regular.ttf", weight: 400 },
  { family: FONT_FAMILY_NAME, file: "LINESeedJP-Bold.ttf", weight: 700 },
  {
    family: CODE_FONT_FAMILY_NAME,
    file: "UDEVGothic-Regular.ttf",
    weight: 400,
  },
  { family: CODE_FONT_FAMILY_NAME, file: "UDEVGothic-Bold.ttf", weight: 700 },
] as const;

export interface SlideProps {
  children?: ReactNode;
  /** ページの背景色。 */
  background?: string;
  /** 文字色。 */
  color?: string;
  /** 内側の余白(px)。 */
  padding?: number;
  /** 中身を縦方向のどこに置くか。 */
  align?: "start" | "center";
}

/**
 * 1ページ分のスライド。
 *
 * `height: 100vh` と `breakAfter: "page"` で1枚=1ページにする。`100%` では
 * ページの高さを取れず背景が途中で切れ、`720px` のような固定値では余白の分だけ
 * はみ出して空ページが増えるので、この2つは動かさないこと。
 * `boxSizing: border-box` は `padding` を高さに含めるために要る。
 */
export const Slide = ({
  children,
  background = SLIDE_THEME.background,
  color = SLIDE_THEME.color,
  padding = 80,
  align = "center",
}: SlideProps) => (
  <section
    style={{
      height: "100vh",
      breakAfter: "page",
      boxSizing: "border-box",
      display: "flex",
      flexDirection: "column",
      justifyContent: align === "center" ? "center" : "flex-start",
      gap: "24px",
      padding: `${padding}px`,
      backgroundColor: background,
      color,
      fontFamily: DEFAULT_FONT_FAMILY,
    }}
  >
    {children}
  </section>
);

export interface DeckMeta {
  title?: string;
  author?: string;
  /** 発表日(`YYYY-MM-DD`)。PDF のメタデータにだけ使う。 */
  date?: string;
}

export { CODE_FONT_FAMILY, CODE_FONT_FAMILY_NAME, SLIDE_THEME } from "./theme";

export { Code } from "./code";

export type { CodeProps } from "./code";
