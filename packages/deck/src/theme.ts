/**
 * `components/` の各コンポーネントと `pdf.ts` が読む色とフォント。
 * コンポーネント同士を参照させると相互参照になるので、ここに置いて共有する。
 */

/** 本文・見出しのフォントのファミリー名。CSS の `font-family` と takumi の登録名で共通。 */
export const FONT_FAMILY_NAME = "LINE Seed JP";

/** 既定のフォント。実ファイルは `packages/deck/fonts` に置いてある。 */
export const DEFAULT_FONT_FAMILY = `'${FONT_FAMILY_NAME}'`;

/** コード（`pre` / `code` / `kbd` / `samp`）のフォントのファミリー名。 */
export const CODE_FONT_FAMILY_NAME = "UDEV Gothic";

/** コードのフォント。字体が読めない環境では等幅に落とす。 */
export const CODE_FONT_FAMILY = `'${CODE_FONT_FAMILY_NAME}', monospace`;

/** 既定の色。デッキごとに `Slide` の props で上書きする。 */
export const SLIDE_THEME = {
  background: "#ffffff",
  color: "#111111",
  muted: "#5f6470",
  /** コード片の背景。 */
  codeBackground: "#f6f7f9",
  /** コード片の枠線。 */
  codeBorder: "#e3e5ea",
  /** リンクの色。 */
  link: "#0969da",
} as const;

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
