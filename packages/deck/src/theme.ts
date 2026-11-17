/**
 * `index.ts`（`Slide` など）と `code.tsx` の両方が読む色とフォント。
 * 片方から読ませると 2 ファイルが相互参照になるので、ここに置いて共有する。
 */

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
} as const;
