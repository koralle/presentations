/**
 * このファイルはブラウザからも読める（プレビューが `slides.tsx` 経由で読む）。
 * takumi-pdf に依存する `renderDeck` は `@koralle/deck/pdf` に分けてある。
 *
 * PDF を作るときは `deck-pdf`（bin/pdf.mjs）が Vite に変換させる。このパッケージの
 * .tsx も変換対象になるので、JSX で書いてよい。
 *
 * スライドに使うコンポーネントは `components/` に置き、ここから出し直す。
 */

/** スライド1枚のサイズ（CSS px）。16:9 で、PDF では 960x540pt(96dpi) になる。 */
export const SLIDE_SIZE = { width: 1280, height: 720 } as const;

export interface DeckMeta {
  title?: string;
  author?: string;
  /** 発表日(`YYYY-MM-DD`)。PDF のメタデータにだけ使う。 */
  date?: string;
}

export {
  CODE_FONT_FAMILY,
  CODE_FONT_FAMILY_NAME,
  DEFAULT_FONT_FACES,
  DEFAULT_FONT_FAMILY,
  FONT_FAMILY_NAME,
  SLIDE_THEME,
} from "./theme";

export { Code } from "./components/code";

export type { CodeProps } from "./components/code";

export { Slide } from "./components/slide";

export type { SlideProps } from "./components/slide";

export { CenterLayout, ContentLayout, TitleLayout } from "./components/layout";

export type {
  CenterLayoutProps,
  ContentLayoutProps,
  TitleLayoutProps,
} from "./components/layout";
