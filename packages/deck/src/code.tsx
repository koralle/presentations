import { createHighlighterCoreSync } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";
import bash from "shiki/langs/bash.mjs";
import json from "shiki/langs/json.mjs";
import tsx from "shiki/langs/tsx.mjs";
import githubLight from "shiki/themes/github-light.mjs";

import { CODE_FONT_FAMILY, SLIDE_THEME } from "./theme";

/**
 * 使う言語だけを静的に登録する。`createHighlighterCoreSync` は同期で、WASM も
 * 非同期の初期化も要らない（プレビューのブラウザでもそのまま動く）。
 * 言語を増やすときは import を足して `LANGS` に並べる。ファイル全体がバンドルに
 * 入るので、使わないものは入れない。
 */
const LANGS = { bash, json, tsx } as const;

type Lang = keyof typeof LANGS;

/** 白いスライドに合わせた明るいテーマ。背景は `SLIDE_THEME.codeBackground` を使う。 */
const THEME = "github-light";

const highlighter = createHighlighterCoreSync({
  themes: [githubLight],
  langs: Object.values(LANGS),
  // 正規表現エンジンは JS 実装。文法によっては変換できない正規表現を含むので、
  // その場合は着色だけ諦めて素のテキストに落とす。
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
