import { createHighlighterCoreSync } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";
import css from "shiki/langs/css.mjs";
import go from "shiki/langs/go.mjs";
import html from "shiki/langs/html.mjs";
import javascript from "shiki/langs/javascript.mjs";
import json from "shiki/langs/json.mjs";
import jsx from "shiki/langs/jsx.mjs";
import nix from "shiki/langs/nix.mjs";
import rust from "shiki/langs/rust.mjs";
import shellscript from "shiki/langs/shellscript.mjs";
import toml from "shiki/langs/toml.mjs";
import tsx from "shiki/langs/tsx.mjs";
import typescript from "shiki/langs/typescript.mjs";
import yaml from "shiki/langs/yaml.mjs";
import githubLight from "shiki/themes/github-light.mjs";

import { CODE_FONT_FAMILY, SLIDE_THEME } from "./theme";

/**
 * 着色に使う文法。`shiki/langs/*` を静的に読むと、その文法だけがバンドルに入る。
 * 使える言語を増やすときは import と `LANGS` に足す。全言語（346）を登録すると
 * ハイライターの初期化だけで 1.7 秒かかるので、必要なものだけにしている。
 */
const LANGS = {
  css,
  go,
  html,
  javascript,
  jsx,
  json,
  nix,
  rust,
  shellscript,
  toml,
  tsx,
  typescript,
  yaml,
} as const;

/**
 * `lang` に書ける値。文法の id と、Shiki が文法側で定義している別名
 * （`javascript` の js/cjs/mjs、`shellscript` の bash など）。別名は文法を
 * 登録していれば Shiki が解決する。
 */
type Lang =
  | keyof typeof LANGS
  | "bash"
  | "cjs"
  | "cts"
  | "js"
  | "mjs"
  | "mts"
  | "rs"
  | "sh"
  | "shell"
  | "yml"
  | "zsh";

/** 白いスライドに合わせた明るいテーマ。背景は `SLIDE_THEME.codeBackground` を使う。 */
const THEME = "github-light";

const highlighter = createHighlighterCoreSync({
  themes: [githubLight],
  langs: Object.values(LANGS),
  // 正規表現エンジンは JS 実装（WASM を読まない）。文法によっては変換できない
  // 正規表現を含むので、その場合は着色だけ諦めて素のテキストに落とす。
  engine: createJavaScriptRegexEngine({ forgiving: true }),
});

export interface CodeProps {
  /** コードの中身。文字列で渡す（`{}` の中でテンプレートリテラルにする）。 */
  children: string;
  /** ファイル名などの見出し。省略すると出ない。 */
  title?: string;
  /** 言語。省略すると着色しない。 */
  lang?: Lang;
  /** 文字サイズ(px)。行が長いときは小さくする。 */
  fontSize?: number;
}

/**
 * コード片。等幅フォント + 薄い背景 + 角丸の枠で出す。
 *
 * 行は折り返す。PDF では枠からはみ出した分が黙って切れるので、`pre` の既定の
 * `white-space: pre` は使わない。改行とインデントは `pre-wrap` が保つ。
 *
 * 着色は 1 トークン = 1 `span` のインライン `color`。takumi はスタイルシートの
 * クラスを解釈しないので、Shiki の `codeToHtml` ではなくトークン API を使う。
 */
export const Code = ({ children, title, lang, fontSize = 18 }: CodeProps) => {
  const lines =
    lang === undefined
      ? null
      : highlighter.codeToTokensBase(children, { lang, theme: THEME });

  return (
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
        <code>
          {lines === null
            ? children
            : lines.map((line, lineIndex) => (
                // 行ごとに span で包んで改行を入れる（`pre-wrap` が改行を保つ）。
                <span key={lineIndex}>
                  {line.map((token, tokenIndex) => (
                    <span key={tokenIndex} style={{ color: token.color }}>
                      {token.content}
                    </span>
                  ))}
                  {lineIndex === lines.length - 1 ? null : "\n"}
                </span>
              ))}
        </code>
      </pre>
    </div>
  );
};
