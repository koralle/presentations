// 自動ランタイムの固定については `src/index.tsx` の先頭コメント参照。
// @jsxRuntime automatic
import { readFile } from "node:fs/promises";
import path from "node:path";

import type { FontSubset } from "@takumi-rs/helpers";
import type { ReactNode } from "react";
import { render } from "takumi-pdf";
import type { PdfMetadata } from "takumi-pdf";

import {
  CODE_FONT_FAMILY,
  DEFAULT_FONT_FACES,
  DEFAULT_FONT_FAMILY,
  SLIDE_SIZE,
} from "./index";
import type { DeckMeta } from "./index";

/**
 * PDF を作る側の入口。`@koralle/deck` 本体はブラウザからも読めるようにして
 * あるので、ネイティブモジュール(takumi-pdf)に依存する処理はこのファイルに隔離する。
 */

export interface RenderDeckOptions {
  deck: DeckMeta;
  slides: readonly ReactNode[];
  /** ページサイズ。既定は {@link SLIDE_SIZE}。 */
  size?: { width: number; height: number };
  /** フォント。既定は `packages/deck/fonts` にある {@link DEFAULT_FONT_FACES}。 */
  fonts?: FontSubset[];
  /** ページの外側の余白(px)。スライドは全面に塗るので既定は 0。 */
  margin?: number;
  /** 既定の言語。 */
  lang?: string;
}

const FONT_DIR = path.join(import.meta.dirname, "..", "fonts");

/** 1 つのフェイスで全コードポイントを賄う（`@font-face` の unicode-range 分割はしない）。 */
const FULL_RANGE: [number, number][] = [[0, 0x10_ff_ff]];

/**
 * takumi の UA スタイルシートは `code` / `pre` に等幅を当てないので、明示的に当てる。
 * プレビュー側は同じ指定が `fonts.css` にある。
 */
const FONT_CSS = `pre, code, kbd, samp { font-family: ${CODE_FONT_FAMILY}; }`;

/**
 * 既定のフォントをリポジトリ同梱のファイルから読む。ビルドにネットワークは要らない。
 * プレビュー（`fonts.css`）と同じバイト列なので、改行位置が両者で食い違わない。
 */
const defaultFonts = (): FontSubset[] =>
  DEFAULT_FONT_FACES.map(({ family, file, weight }) => ({
    name: family,
    key: `${file}:${weight}`,
    weight,
    style: "normal",
    unicodeRange: FULL_RANGE,
    data: async () => {
      const bytes = await readFile(path.join(FONT_DIR, file));

      return Uint8Array.from(bytes).buffer;
    },
  }));

/**
 * スライドを PDF のバイト列にする。
 *
 * フォントは既定でこのリポジトリのファイル（`packages/deck/fonts`）を使う。
 * Google Fonts など別のフォントにしたいときは `fonts` に渡す。
 */
export const renderDeck = async ({
  deck,
  slides,
  size = SLIDE_SIZE,
  fonts,
  margin = 0,
  lang = "ja",
}: RenderDeckOptions): Promise<Uint8Array> => {
  const resolvedFonts = fonts ?? defaultFonts();
  const metadata: PdfMetadata = { creator: "takumi-pdf" };

  if (deck.title !== undefined && deck.title !== "") {
    metadata.title = deck.title;
  }

  if (deck.author !== undefined) {
    metadata.authors = [deck.author];
  }

  if (deck.date !== undefined) {
    metadata.creationDate = deck.date;
  }

  return await render(
    <main style={{ display: "block", fontFamily: DEFAULT_FONT_FAMILY }}>
      {slides}
    </main>,
    {
      size,
      margin,
      fonts: resolvedFonts,
      css: FONT_CSS,
      lang,
      metadata,
    }
  );
};
