import { Slide, SLIDE_THEME } from "@koralle/deck";

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
];
