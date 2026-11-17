import type { ReactNode } from "react";

import { CODE_FONT_FAMILY, SLIDE_THEME } from "./theme";

export interface CodeProps {
  /** コードの中身。文字列で渡す（`{}` の中でテンプレートリテラルにする）。 */
  children?: ReactNode;
  /** ファイル名などの見出し。省略すると出ない。 */
  title?: string;
  /** 文字サイズ(px)。行が長いときは小さくする。 */
  fontSize?: number;
}

/**
 * コード片。等幅フォント + 薄い背景 + 角丸の枠で出す。
 *
 * 行は折り返す。PDF では枠からはみ出した分が黙って切れるので、`pre` の既定の
 * `white-space: pre` は使わない。改行とインデントは `pre-wrap` が保つ。
 */
export const Code = ({ children, title, fontSize = 18 }: CodeProps) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      gap: "8px",
      // 折り返しを効かせるため、flex 項目が中身の幅で伸びないようにする。
      minWidth: 0,
    }}
  >
    {title === undefined ? null : (
      <div style={{ color: SLIDE_THEME.muted, fontSize: 16 }}>{title}</div>
    )}
    <pre
      style={{
        background: SLIDE_THEME.codeBackground,
        border: `1px solid ${SLIDE_THEME.codeBorder}`,
        borderRadius: "12px",
        color: SLIDE_THEME.color,
        fontFamily: CODE_FONT_FAMILY,
        fontSize,
        lineHeight: 1.55,
        margin: 0,
        overflowWrap: "break-word",
        padding: "24px",
        whiteSpace: "pre-wrap",
      }}
    >
      <code>{children}</code>
    </pre>
  </div>
);
