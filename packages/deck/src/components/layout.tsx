import type { ReactNode } from "react";

import { SLIDE_THEME } from "../theme";

export interface TitleLayoutProps {
  /** 表紙のタイトル。 */
  title: string;
  /** 任意のサブタイトル。 */
  subtitle?: string;
  /** 任意の小さめのメタ行(日付など)。 */
  meta?: string;
}

/**
 * 表紙用のレイアウト。`Slide` の中に置いて使う。
 *
 * 縦中央の配置は `Slide` の既定(`align="center"`)に任せ、ここでは h1/p/p を
 * 並べるだけにする。ラッパーの div を挟まずフラグメントで返すことで、各要素が
 * `Slide` の直下 flex 子になり、行間は `Slide` の `gap` が持つ。各要素は
 * `margin: 0` にして余白の二重取りを避ける。
 */
export const TitleLayout = ({ title, subtitle, meta }: TitleLayoutProps) => (
  <>
    <h1 style={{ fontSize: 64, margin: 0 }}>{title}</h1>
    {subtitle === undefined ? null : (
      <p style={{ fontSize: 28, color: SLIDE_THEME.muted, margin: 0 }}>
        {subtitle}
      </p>
    )}
    {meta === undefined ? null : (
      <p style={{ fontSize: 20, color: SLIDE_THEME.muted, margin: 0 }}>
        {meta}
      </p>
    )}
  </>
);

export interface CenterLayoutProps {
  children?: ReactNode;
}

/**
 * 短い強調テキスト(引用・区切り・ひとこと)を中央に置くレイアウト。
 * `Slide` の中に置いて使う。
 *
 * 縦の中央配置は `Slide` の既定(`align="center"`)に任せ、ここでは横方向の
 * 中央揃えと既定文字サイズ(36px)だけを担当する。子が自分で `fontSize` を
 * 持てばそのインラインスタイルが継承値に勝つので、小さくしたければ子側で
 * 指定する。`width: "100%"` は flex の交差軸 stretch に頼らず中央揃えの
 * 基準幅を確定させるため(takumi が stretch を実装しているとは限らない)。
 */
export const CenterLayout = ({ children }: CenterLayoutProps) => (
  <div style={{ width: "100%", textAlign: "center", fontSize: 36 }}>
    {children}
  </div>
);

export interface ContentLayoutProps {
  /** 見出し。文字列のほか `<code>` などを含む JSX も置ける。 */
  heading: ReactNode;
  children?: ReactNode;
}

/**
 * 「見出し + コンテンツ」のレイアウト。`Slide` の中に置いて使う。
 *
 * 見出しを自動高さ・コンテンツを残り高さにするため、中身全体を 1 つの
 * CSS Grid(`gridTemplateRows: "auto 1fr"`)にする。`Slide` の `gap` は直下の
 * 要素の間にしか効かない(グリッドは `Slide` の唯一の子)なので、行間はグリッド
 * 側の `gap` で持たせ、グリッドは `height: "100%"` で `Slide` の内容領域を
 * 埋める。コンテンツセルに `minHeight: 0` を当てないと行の最小高さ(既定
 * `auto`)が内容量に引きずられ、見出しを押しのけてしまう。本文の文字サイズは
 * children 側に委ね、ここでは固定しない。
 */
export const ContentLayout = ({ heading, children }: ContentLayoutProps) => (
  <div
    style={{
      display: "grid",
      gridTemplateRows: "auto 1fr",
      gap: "24px",
      height: "100%",
    }}
  >
    <h2 style={{ fontSize: 24, margin: 0 }}>{heading}</h2>
    <div style={{ minHeight: 0 }}>{children}</div>
  </div>
);
