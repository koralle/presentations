import type { ReactNode } from "react";

import { DEFAULT_FONT_FAMILY, SLIDE_THEME } from "../theme";

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
  padding = 48,
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
