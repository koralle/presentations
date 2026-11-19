import {
  CenterLayout,
  Code,
  ContentLayout,
  Slide,
  SLIDE_THEME,
} from "@koralle/deck";
import { Fragment } from "react";
import type { CSSProperties, ReactNode } from "react";

const EVENT_NAME = "React Tokyo ミートアップ #22";
const EVENT_DATE = "2026/11/20, Fri";

/** `vercel-labs/agent-skills` の skills/ のうち使っている三種の神器。 */
const VERCEL_SKILLS = [
  {
    name: "react-best-practices",
    note: "React / Next.js の性能ルール集",
  },
  {
    name: "react-view-transitions",
    note: "View Transition API で画面遷移を演出する",
  },
  {
    name: "composition-patterns",
    note: "複合コンポーネントなど再利用できる設計パターン",
  },
] as const;

const DEVTOOLS_SKILLS = [
  {
    name: "chrome-devtools",
    note: "MCP ツールでページをデバッグ・自動操作する",
  },
  {
    name: "chrome-devtools-cli",
    note: "CLI をシェルスクリプトから使う",
  },
  {
    name: "a11y-debugging",
    note: "アクセシビリティの問題を監査・修正する",
  },
  {
    name: "cookie-debugging",
    note: "Cookie・セッション・認証をデバッグする",
  },
  {
    name: "debug-optimize-lcp",
    note: "Largest Contentful Paint を計測して改善する",
  },
  {
    name: "memory-leak-debugging",
    note: "メモリリークを見つけて直す",
  },
  {
    name: "troubleshooting",
    note: "MCP と Chrome の接続問題を解決する",
  },
] as const;

/** 目次。以降のスライドの見出しと対応させ、節だけを並べる。 */
const CONTENTS = [
  "Modern Web Guidance",
  "vercel-labs 三種の神器",
  "Chrome DevTools MCP",
  "Ultracite",
] as const;

const BODY_CENTER: CSSProperties = {
  height: "100%",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
};

const INLINE_CODE: CSSProperties = {
  background: SLIDE_THEME.codeBackground,
  border: `1px solid ${SLIDE_THEME.codeBorder}`,
  borderRadius: "6px",
  padding: "2px 8px",
  fontSize: "0.9em",
};

const PANEL: CSSProperties = {
  background: SLIDE_THEME.codeBackground,
  border: `1px solid ${SLIDE_THEME.codeBorder}`,
  borderRadius: "12px",
  padding: "24px 28px",
};

const SKILL_TABLE: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "max-content 1fr",
  fontSize: 20,
  lineHeight: 1.5,
  margin: 0,
};

const SKILL_TERM: CSSProperties = {
  fontWeight: 700,
  padding: "12px 28px 12px 0",
  borderBottom: `1px solid ${SLIDE_THEME.codeBorder}`,
};

const SKILL_DETAIL: CSSProperties = {
  margin: 0,
  color: SLIDE_THEME.muted,
  padding: "12px 0",
  borderBottom: `1px solid ${SLIDE_THEME.codeBorder}`,
};

/** リストの黒丸。`::marker` の縦位置がブラウザと takumi で揃わないので自前で描く。 */
const BULLET: CSSProperties = {
  display: "inline-block",
  flexShrink: 0,
  width: "0.35em",
  height: "0.35em",
  borderRadius: "50%",
  background: SLIDE_THEME.color,
  marginTop: "0.58em",
};

const BULLET_LIST: CSSProperties = {
  listStyleType: "none",
  paddingInlineStart: 0,
  margin: 0,
  display: "flex",
  flexDirection: "column",
  gap: "14px",
};

const BULLET_ITEM: CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  gap: "0.55em",
  lineHeight: 1.55,
};

const FOOTER: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  fontSize: 14,
  color: SLIDE_THEME.muted,
  borderTop: `1px solid ${SLIDE_THEME.codeBorder}`,
  paddingTop: "12px",
};

const InlineCode = ({
  children,
  background,
}: {
  children: ReactNode;
  background?: string;
}) => (
  <code
    style={
      background === undefined ? INLINE_CODE : { ...INLINE_CODE, background }
    }
  >
    {children}
  </code>
);

const BulletItem = ({ children }: { children: ReactNode }) => (
  <li style={BULLET_ITEM}>
    <span aria-hidden style={BULLET} />
    <span>{children}</span>
  </li>
);

const SlideLayout = ({
  heading,
  children,
}: {
  heading: ReactNode;
  children: ReactNode;
}) => (
  <div
    style={{
      display: "grid",
      gridTemplateRows: "1fr auto",
      gap: "16px",
      height: "100%",
    }}
  >
    <div style={{ minHeight: 0 }}>
      <ContentLayout heading={heading}>{children}</ContentLayout>
    </div>
    <footer style={FOOTER}>
      <span>{EVENT_NAME}</span>
      <span>{EVENT_DATE}</span>
    </footer>
  </div>
);

// 1要素 = 1ページ。`Slide` を並べるだけで改ページされる。
export const slides = [
  <Slide key="cover">
    <CenterLayout>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "24px",
        }}
      >
        <a
          href="https://react-tokyo.connpass.com/event/409474/"
          target="_blank"
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: SLIDE_THEME.link,
            textDecoration: "none",
          }}
        >
          {EVENT_NAME}
        </a>
        <div
          style={{
            width: 64,
            height: 4,
            borderRadius: 2,
            background: SLIDE_THEME.link,
          }}
        />
        <h1
          style={{
            fontSize: 48,
            fontWeight: 700,
            lineHeight: 1.4,
            margin: 0,
          }}
        >
          自分がAIエージェントとReactを書くときに
          <br />
          使っているもの達を紹介する
        </h1>
        <p
          style={{
            fontSize: 22,
            color: SLIDE_THEME.muted,
            margin: 0,
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <span>{EVENT_DATE}</span>
          <span aria-hidden>·</span>
          <span>koralle</span>
        </p>
      </div>
    </CenterLayout>
  </Slide>,

  <Slide key="self-introduction">
    <SlideLayout heading={<>自己紹介</>}>
      <div
        style={{
          height: "100%",
          display: "grid",
          gridTemplateColumns: "280px 1fr",
          alignItems: "center",
          gap: "56px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "20px",
          }}
        >
          <img
            src="/koralle.png"
            alt="koralle のプロフィール画像"
            style={{
              width: 220,
              height: 220,
              borderRadius: "50%",
              border: `1px solid ${SLIDE_THEME.codeBorder}`,
            }}
          />
          <h3 style={{ fontSize: 32, fontWeight: 700, margin: 0 }}>koralle</h3>
        </div>

        <ul style={{ ...BULLET_LIST, fontSize: 24, gap: "18px" }}>
          <BulletItem>
            GitHub:{" "}
            <a href="https://github.com/koralle" target="_blank">
              koralle
            </a>
          </BulletItem>
          <BulletItem>フロントエンドエンジニア</BulletItem>
          <BulletItem>
            ここ2年半くらいは{" "}
            <a
              href="https://tech.layerx.co.jp/entry/bakuraku-monorepo-and-frontend-enabling"
              target="_blank"
            >
              Frontend Enabling
            </a>{" "}
            っぽいことをやってる（多分）
          </BulletItem>
          <BulletItem>
            競馬民（最近好きな馬は{" "}
            <a href="https://db.netkeiba.com/horse/2023100724/" target="_blank">
              サノノグレーター
            </a>
            ）
          </BulletItem>
          <BulletItem>
            <a href="https://yamada-ui.com" target="_blank">
              Yamada UI
            </a>{" "}
            のメンテナ
          </BulletItem>
          <BulletItem>
            最近よく使うハーネスは{" "}
            <a href="https://pi.dev/" target="_blank">
              Pi Coding Agent
            </a>
          </BulletItem>
        </ul>
      </div>
    </SlideLayout>
  </Slide>,

  <Slide key="table-of-contents">
    <SlideLayout heading={<>Table of Contents</>}>
      <div style={BODY_CENTER}>
        <ol
          style={{
            listStyleType: "none",
            paddingInlineStart: 0,
            margin: 0,
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          {CONTENTS.map((name, index) => (
            <li
              key={name}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "24px",
                padding: "16px 24px",
                background: SLIDE_THEME.codeBackground,
                border: `1px solid ${SLIDE_THEME.codeBorder}`,
                borderRadius: "12px",
              }}
            >
              <span
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  color: SLIDE_THEME.link,
                  minWidth: "1.6em",
                }}
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <span style={{ fontSize: 30, fontWeight: 700 }}>{name}</span>
            </li>
          ))}
        </ol>
      </div>
    </SlideLayout>
  </Slide>,

  <Slide key="modern-web-guidance">
    <SlideLayout heading={<>Modern Web Guidance</>}>
      <div style={{ ...BODY_CENTER, gap: "24px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <p style={{ fontSize: 24, lineHeight: 1.5, margin: 0 }}>
            Google Chrome
            の開発チームが公開。Webプラットフォームに関するベスプラを詰め込んだ
            Skill
          </p>
          <a
            href="https://developer.chrome.com/docs/modern-web-guidance?hl=ja"
            target="_blank"
            style={{ fontSize: 18 }}
          >
            https://developer.chrome.com/docs/modern-web-guidance?hl=ja
          </a>
        </div>

        <div
          style={{
            border: `1px solid ${SLIDE_THEME.codeBorder}`,
            borderRadius: "12px",
            overflow: "hidden",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <img
            src="/mwg-hero.png"
            alt="Modern Web Guidance のページのヒーローセクション"
            style={{ width: 1182, height: 388, display: "block" }}
          />
        </div>
      </div>
    </SlideLayout>
  </Slide>,

  <Slide key="vercel-labs">
    <SlideLayout heading={<>vercel-labs 三種の神器</>}>
      <div style={BODY_CENTER}>
        <dl style={{ ...SKILL_TABLE, fontSize: 24 }}>
          {VERCEL_SKILLS.map(({ name, note }) => (
            <Fragment key={name}>
              <dt style={{ ...SKILL_TERM, padding: "22px 36px 22px 0" }}>
                <a
                  href={`https://github.com/vercel-labs/agent-skills/tree/main/skills/${name}`}
                  target="_blank"
                >
                  <code>{name}</code>
                </a>
              </dt>
              <dd style={{ ...SKILL_DETAIL, padding: "22px 0" }}>{note}</dd>
            </Fragment>
          ))}
        </dl>
      </div>
    </SlideLayout>
  </Slide>,

  <Slide key="chrome-devtools-mcp_1">
    <SlideLayout heading={<>Chrome DevTools MCP</>}>
      <div style={{ ...BODY_CENTER, gap: "28px" }}>
        <p
          style={{ fontSize: 30, fontWeight: 700, lineHeight: 1.45, margin: 0 }}
        >
          名前の通り Chrome DevTools チームが作ってる MCP サーバー。
        </p>

        <div
          style={{
            ...PANEL,
            borderLeft: `4px solid ${SLIDE_THEME.link}`,
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          <p style={{ fontSize: 24, lineHeight: 1.6, margin: 0 }}>
            Chrome DevTools でできることは大体できる。
          </p>
          <p
            style={{
              fontSize: 24,
              lineHeight: 1.6,
              margin: 0,
              color: SLIDE_THEME.muted,
            }}
          >
            画面操作の自動化は{" "}
            <a
              href="https://playwright.dev/docs/getting-started-mcp"
              target="_blank"
            >
              Playwright MCP
            </a>
            でいいけど、不具合調査やパフォーマンス改善するならこっち。
          </p>
        </div>

        <a
          href="https://github.com/ChromeDevTools/chrome-devtools-mcp"
          target="_blank"
          style={{ fontSize: 20 }}
        >
          https://github.com/ChromeDevTools/chrome-devtools-mcp
        </a>
      </div>
    </SlideLayout>
  </Slide>,

  <Slide key="chrome-devtools-mcp_2">
    <SlideLayout heading={<>Chrome DevTools MCP</>}>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <p style={{ fontSize: 20, lineHeight: 1.5, margin: 0 }}>
          業務で使うために安全側に倒すとこんな感じになりそう（
          <a
            href="https://github.com/ChromeDevTools/chrome-devtools-mcp"
            target="_blank"
          >
            リファレンス
          </a>
          に色々書いてるので必読）
        </p>

        <Code lang="json" title=".mcp.json" fontSize={13}>
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
                    "--no-file-navigations",
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
      </div>
    </SlideLayout>
  </Slide>,

  <Slide key="chrome-devtools-mcp_3">
    <SlideLayout heading={<>Chrome DevTools MCP</>}>
      <div style={{ ...BODY_CENTER, gap: "24px" }}>
        <p style={{ fontSize: 22, lineHeight: 1.5, margin: 0 }}>
          <InlineCode>Chrome DevTools MCP</InlineCode> と組み合わせて使える
          Skill も配布されてる。
        </p>

        <dl style={SKILL_TABLE}>
          {DEVTOOLS_SKILLS.map(({ name, note }) => (
            <Fragment key={name}>
              <dt style={SKILL_TERM}>
                <a
                  href={`https://github.com/ChromeDevTools/chrome-devtools-mcp/tree/main/skills/${name}`}
                  target="_blank"
                >
                  <code>{name}</code>
                </a>
              </dt>
              <dd style={SKILL_DETAIL}>{note}</dd>
            </Fragment>
          ))}
        </dl>
      </div>
    </SlideLayout>
  </Slide>,

  <Slide key="ultracite_1">
    <SlideLayout heading={<>Ultracite</>}>
      <div style={{ ...BODY_CENTER, gap: "24px" }}>
        <p
          style={{ fontSize: 24, fontWeight: 700, lineHeight: 1.5, margin: 0 }}
        >
          AIエージェントが書いてくる低品質なコード（:=
          Slop）を改善することを目的としたツール。
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "28px",
            alignItems: "start",
          }}
        >
          <div
            style={{ display: "flex", flexDirection: "column", gap: "18px" }}
          >
            <ul style={{ ...BULLET_LIST, fontSize: 21 }}>
              <BulletItem>
                ラッパー CLI とルールのプリセット群で構成されている。
              </BulletItem>
              <BulletItem>
                バックエンドは <InlineCode>Oxlint</InlineCode> +{" "}
                <InlineCode>Oxfmt</InlineCode>（推奨）のほか、
                <br />
                <InlineCode>Biome</InlineCode> や{" "}
                <InlineCode>ESLint</InlineCode> から選べる。
              </BulletItem>
            </ul>

            <a
              href="https://www.ultracite.ai/"
              target="_blank"
              style={{ fontSize: 18 }}
            >
              https://www.ultracite.ai/
            </a>
          </div>

          <div
            style={{
              ...PANEL,
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            <p style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>
              <InlineCode background={SLIDE_THEME.background}>
                ultracite init
              </InlineCode>{" "}
              では Linter 自体の設定の他にも
            </p>
            <ul style={{ ...BULLET_LIST, fontSize: 19, gap: "10px" }}>
              <BulletItem>エディタ設定</BulletItem>
              <BulletItem>
                <InlineCode background={SLIDE_THEME.background}>
                  AGENTS.md
                </InlineCode>
              </BulletItem>
              <BulletItem>
                編集後に自動で{" "}
                <InlineCode background={SLIDE_THEME.background}>fix</InlineCode>{" "}
                を走らせるフックや、
                <br />
                <InlineCode background={SLIDE_THEME.background}>
                  pre-commit
                </InlineCode>{" "}
                とか{" "}
                <InlineCode background={SLIDE_THEME.background}>
                  Lefthook
                </InlineCode>{" "}
                の連携
              </BulletItem>
            </ul>
            <p style={{ fontSize: 19, color: SLIDE_THEME.muted, margin: 0 }}>
              までやってくれる。便利。
            </p>
          </div>
        </div>

        <Code lang="bash" title="Scaffold" fontSize={20}>
          {`
            ultracite init
          `}
        </Code>
      </div>
    </SlideLayout>
  </Slide>,

  <Slide key="ultracite_commands">
    <SlideLayout heading={<>Ultracite</>}>
      <div style={BODY_CENTER}>
        <Code lang="bash" title="チェックと一括修正" fontSize={22}>
          {`
            # チェックだけ（CIやレビューで）
            ultracite check

            # oxlintとoxfmtを同時に実行して一括修正
            ultracite fix --type-aware

            # autofixで直しきれない診断はエージェントCLIに投げて直させる
            ultracite fix --claude
          `}
        </Code>
      </div>
    </SlideLayout>
  </Slide>,

  <Slide key="ultracite_2">
    <SlideLayout heading={<>Ultracite を Oxlint に組み込む</>}>
      <div style={{ ...BODY_CENTER, gap: "12px" }}>
        <p style={{ fontSize: 22, lineHeight: 1.5, margin: 0 }}>
          <InlineCode>anti-slop</InlineCode> はエージェントがやりがちな Slop
          な書き方を直接弾くルールセット。
        </p>
        <Code lang="typescript" title="oxlint.config.ts" fontSize={18}>
          {`
            import { defineConfig } from "oxlint";
            import antiSlop from "ultracite/oxlint/anti-slop";
            import core from "ultracite/oxlint/core";
            import playwright from "ultracite/oxlint/playwright";
            import react from "ultracite/oxlint/react";
            import tanstack from "ultracite/oxlint/tanstack";
            import vitest from "ultracite/oxlint/vitest";

            export default defineConfig({
              env: core.env,
              extends: [core, react, tanstack, vitest, playwright, antiSlop],
              ignorePatterns: core.ignorePatterns,
            });
          `}
        </Code>
      </div>
    </SlideLayout>
  </Slide>,
];
