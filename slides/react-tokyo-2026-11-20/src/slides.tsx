import { Code, Slide, SLIDE_THEME } from "@koralle/deck";

// 仮のスライド。発表内容に差し替える。
// 1要素 = 1ページ。`Slide` を並べるだけで改ページされる。
export const slides = [
  <Slide key="cover" align="start">
    <h1 style={{ fontSize: 64, margin: 0 }}>React Tokyo 2026-11-20</h1>
    <p style={{ fontSize: 28, color: SLIDE_THEME.muted, margin: 0 }}>
      JSX で書いたスライドを PDF にする
    </p>
    <p style={{ fontSize: 20, color: SLIDE_THEME.muted, margin: 0 }}>
      2026-11-20
    </p>
  </Slide>,

  <Slide key="pipeline">
    <h2 style={{ fontSize: 44, margin: 0 }}>仕組み</h2>
    <ul style={{ fontSize: 28, lineHeight: 1.6, margin: 0, paddingLeft: 40 }}>
      <li>スライドは JSX(`Slide`)で書く</li>
      <li>takumi-pdf がレイアウトして PDF を作る</li>
      <li>ヘッドレスブラウザを起動しない</li>
      <li>文字は選択できる(ベクタ + サブセット埋め込み)</li>
    </ul>
  </Slide>,

  <Slide key="next">
    <h2 style={{ fontSize: 44, margin: 0 }}>ここから</h2>
    <p style={{ fontSize: 28, margin: 0 }}>
      pnpm --filter react-tokyo-2026-11-20 pdf で dist/ に PDF が出る
    </p>
  </Slide>,

  <Slide key="modern-web-guidance">
    <h2>Modern Web Guidance</h2>
  </Slide>,

  <Slide key="vercel-labs">
    <h2>
      {" "}
      <code>vercel-labs</code> 三種の神器
    </h2>

    <ol>
      <li>react-best-practices</li>
      <li>react-view-transitions</li>
      <li>composition-patterns</li>
    </ol>
  </Slide>,

  <Slide key="chrome-devtools-mcp_1">
    <h2>Chrome DevTools MCP</h2>
  </Slide>,

  <Slide key="chrome-devtools-mcp_2">
    <h2>Chrome DevTools MCP</h2>

    <p>
      業務で使うために安全側に倒すとこんな感じになりそう（
      <a
        href="https://github.com/ChromeDevTools/chrome-devtools-mcp"
        target="_blank"
      >
        リファレンス
      </a>
      を読みましょう）
    </p>

    <Code lang="json" title=".mcp.json" fontSize={14}>
      {`
        {
          "mcpServers": {
            "chrome-devtools": {
              "command": "pnpm",
              "args": [
                "dlx",
                "chrome-devtools-mcp@1.13.0",
                "--no-usage-statistics",
                "--allowed-url-pattern=http://localhost:*/*",
                "--allowed-url-pattern=http://127.0.0.1:*/*",
                "--isolated",
                "--file-navigations=false",
                "--no-performance-crux",
                "--redact-network-headers",
                "--screenshot-format=webp",
                "--screenshot-max-width=1280"
              ]
            }
          }
        }
      `}
    </Code>
  </Slide>,

  <Slide key="chrome-devtools-mcp_3">
    <h2>Chrome DevTools MCP</h2>

    <p>MCPだけじゃなくSkillも入れると良さそう</p>

    <ul>
      <li>chrome-devtools</li>
      <li>chrome-devtools-cli</li>
      <li>a11y-debugging</li>
      <li>cookie-debugging</li>
      <li>debug-optimize-mcp</li>
      <li>memory-leak-debugging</li>
      <li>troubleshooting</li>
    </ul>
  </Slide>,

  <Slide key="ultracite_1">
    <h2>Ultracite</h2>
    <p>
      AIエージェントが書いてくる低品質なコード（:= <b>Slop</b>
      ）を改善することを目的としたツール。
    </p>
    <p>
      ラッパーCLIとルールのプリセット群で構成されている。要らなくなったら剥がしやすそう。
    </p>
  </Slide>,

  <Slide>
    <Code lang="typescript" title="oxlint.config.ts">
      {`
        import { defineConfig } from "oxlint";
        import antiSlop from "ultracite/oxlint/anti-slop";
        import core from "ultracite/oxlint/core";
        import playwright from "ultracite/oxlint/playwright"
        import react from "ultracite/oxlint/react";
        import tanstack from "ultracite/oxlint/tanstack";
        import vitest from "ultracite/oxlint/vitest"

        export default defineConfig({
          env: core.env,
          extends: [core, react, tanstack, vitest, playwright, antiSlop],
          ignorePatterns: core.ignorePatterns,
        });
      `}
    </Code>
  </Slide>,
];
