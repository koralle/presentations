import { Slide } from "@koralle/deck";
import { DeckViewer } from "@koralle/preview";
import type { ReactNode } from "react";
import { createRoot } from "react-dom/client";

import { TOTAL } from "../params";

/**
 * E2E の題材。20 枚あれば「先頭 / 末尾 / 途中」と一覧の折り返しを全部踏める。
 * 5 枚目だけ入力欄と選択肢を持つ（デッキはインタラクティブな部品をスライドに
 * 置けるので、キーを横取りしないことをここで見る）。
 */
const slides: ReactNode[] = Array.from({ length: TOTAL }, (_, index) => (
  <Slide key={index}>
    <h1 style={{ fontSize: 64, margin: 0 }}>{index + 1} 枚目</h1>
    {index === 4 ? (
      <>
        <input aria-label="メモ" />
        <label>
          <input type="checkbox" /> 同意する
        </label>
        <select
          aria-label="色"
          style={{ backgroundColor: "#ffffff", colorScheme: "light" }}
        >
          <option value="red">赤</option>
          <option value="blue">青</option>
        </select>
      </>
    ) : null}
  </Slide>
));

const container = document.querySelector("#root");

if (container === null) {
  throw new Error("fixture/preview/index.html に #root が無い");
}

createRoot(container).render(
  <DeckViewer deck={{ title: "E2E フィクスチャ" }} slides={slides} />
);
